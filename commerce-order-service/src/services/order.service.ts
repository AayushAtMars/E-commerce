import axios from 'axios';
import { nanoid } from 'nanoid';
import { Order, IOrderAddress, ShippingType, PaymentMethod, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { DeliveryPartner } from '../models/DeliveryPartner';
import { createError } from '../middlewares/error.middleware';
import { env } from '../config/env';
import mongoose from 'mongoose';
import { sendOrderPlacedEmail, sendOrderStatusEmail, sendOrderCancelledEmail } from './email.service';

const SHIPPING_COSTS: Record<ShippingType, number> = {
  Economy: 49,
  Cargo: 99,
  Express: 199,
};



// Status transition graph
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  'Placed': 'In Progress',
  'In Progress': 'On the Way',
  'On the Way': 'Delivered',
};

/**
 * Round-robin delivery partner assignment.
 * Picks the active partner with the lowest ordersCount,
 * then increments their counter so the next order goes to someone else.
 */
async function assignNextDeliveryPartner() {
  const partner = await DeliveryPartner
    .findOneAndUpdate(
      { isActive: true },
      { $inc: { ordersCount: 1 } },
      { sort: { ordersCount: 1, _id: 1 }, new: false } // sort ASC so the least-used comes first
    );

  if (!partner) return null;

  return {
    _id: partner._id.toString(),
    name: partner.name,
    phone: partner.phone,
    avatar: partner.avatar,
    vehicle: partner.vehicle,
    rating: partner.rating,
  };
}

interface CreateOrderInput {
  userId: string;
  userEmail?: string;
  userName?: string;
  shippingAddress: IOrderAddress;
  shippingType: ShippingType;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

async function refreshPrice(productId: string) {
  try {
    const res = await axios.get(
      `${env.CATALOG_SERVICE_URL}/internal/products/${productId}/price`,
      { headers: { 'x-internal-key': env.INTERNAL_SERVICE_KEY }, timeout: 5000 }
    );
    return res.data.data as { price: number; title: string; stock: number; image?: string };
  } catch {
    throw createError('Product unavailable. Please refresh your cart.', 502, 'CATALOG_UNAVAILABLE');
  }
}

async function validatePromoInternal(code: string, subtotal: number) {
  try {
    const res = await axios.post(
      `${env.CATALOG_SERVICE_URL}/internal/coupons/validate`,
      { code, subtotal },
      { headers: { 'x-internal-key': env.INTERNAL_SERVICE_KEY }, timeout: 5000 }
    );
    return res.data.data.discountAmount as number;
  } catch (err: any) {
    if (err.response?.status === 400 || err.response?.status === 404 || err.response?.status === 409) {
      throw createError(err.response.data.message || 'Invalid promo code', 400, 'INVALID_PROMO');
    }
    throw createError('Unable to validate promo code at this time.', 502, 'CATALOG_UNAVAILABLE');
  }
}

async function recordPromoUsageInternal(code: string) {
  try {
    await axios.post(
      `${env.CATALOG_SERVICE_URL}/internal/coupons/record-usage`,
      { code },
      { headers: { 'x-internal-key': env.INTERNAL_SERVICE_KEY }, timeout: 5000 }
    );
  } catch (err) {
    console.error('Failed to record promo usage:', err);
  }
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;
}

function deliveryDays(type: ShippingType) {
  return { Economy: 7, Cargo: 4, Express: 1 }[type];
}


// ─── Create order ─────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput) {
  const { userId, userEmail, userName, shippingAddress, shippingType, paymentMethod, promoCode } = input;

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw createError('Your cart is empty.', 400, 'EMPTY_CART');
  }

  const pricedItems = await Promise.all(
    cart.items.map(async (item) => {
      const fresh = await refreshPrice(item.productId.toString());
      if (fresh.stock < item.quantity) {
        throw createError(
          `"${fresh.title}" only has ${fresh.stock} units in stock.`,
          409,
          'INSUFFICIENT_STOCK'
        );
      }
      return {
        productId: item.productId.toString(),
        title: fresh.title,
        image: fresh.image || item.image,
        price: fresh.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      };
    })
  );

  const subtotal = pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = SHIPPING_COSTS[shippingType];

  let discount = 0;
  if (promoCode) {
    discount = await validatePromoInternal(promoCode, subtotal);
  }

  const total = Math.max(0, subtotal + shippingCost - discount);

  const initialDeliveryAgent = await assignNextDeliveryPartner();

  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(userId),
    userEmail,
    userName,
    orderNumber: generateOrderNumber(),
    items: pricedItems,
    shippingAddress,
    shippingType,
    shippingCost,
    paymentMethod,
    subtotal,
    discount,
    total,
    promoCode: promoCode?.toUpperCase(),
    status: 'Placed',
    statusHistory: [{ status: 'Placed', timestamp: new Date(), note: 'Order placed successfully.' }],
    estimatedDelivery: new Date(Date.now() + deliveryDays(shippingType) * 86_400_000),
    deliveryAgent: initialDeliveryAgent || undefined,
  });

  if (promoCode) {
    await recordPromoUsageInternal(promoCode);
  }

  await Cart.findOneAndUpdate({ userId }, { items: [] });

  // Fire-and-forget email
  if (userEmail && userName) {
    sendOrderPlacedEmail(userEmail, userName, order).catch(err => {
      console.error(`[Email] Failed to send order placed email for ${order.orderNumber}:`, err);
    });
  }

  return order;
}

// ─── List orders ──────────────────────────────────────────────────────────────

export async function getUserOrders(userId: string, status?: string) {
  const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
  if (status) query.status = status;
  return Order.find(query).sort({ createdAt: -1 });
}

// ─── Get single order ─────────────────────────────────────────────────────────

export async function getOrderById(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw createError('Order not found.', 404, 'ORDER_NOT_FOUND');
  return order;
}

// ─── Cancel order ─────────────────────────────────────────────────────────────

export async function cancelOrder(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw createError('Order not found.', 404, 'ORDER_NOT_FOUND');
  if (!['Placed', 'In Progress'].includes(order.status)) {
    throw createError('Order cannot be cancelled at this stage.', 409, 'CANNOT_CANCEL');
  }

  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', timestamp: new Date(), note: 'Cancelled by user.' });
  await order.save();

  if (order.userEmail && order.userName) {
    sendOrderCancelledEmail(order.userEmail, order.userName, order).catch(err => {
      console.error(`[Email] Failed to send order cancelled email for ${order.orderNumber}:`, err);
    });
  }

  return order;
}

// ─── Advance order status (Phase 4) ──────────────────────────────────────────

export async function advanceOrderStatus(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw createError('Order not found.', 404, 'ORDER_NOT_FOUND');

  const next = NEXT_STATUS[order.status];
  if (!next) {
    throw createError(
      `Order is already "${order.status}" and cannot be advanced.`,
      409,
      'CANNOT_ADVANCE'
    );
  }

  order.status = next;

  const notes: Record<string, string> = {
    'In Progress': 'Your order is being prepared.',
    'On the Way': 'Your order is on its way!',
    'Delivered': 'Your order has been delivered. Enjoy! 🎉',
  };
  order.statusHistory.push({ status: next, timestamp: new Date(), note: notes[next] });

  // (Delivery partner is now assigned immediately upon order creation)

  await order.save();

  if (order.userEmail && order.userName) {
    sendOrderStatusEmail(order.userEmail, order.userName, order, next).catch(err => {
      console.error(`[Email] Failed to send order status email for ${order.orderNumber}:`, err);
    });
  }

  return order;
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorder(userId: string, orderId: string) {
  const original = await Order.findOne({ _id: orderId, userId });
  if (!original) throw createError('Original order not found.', 404, 'ORDER_NOT_FOUND');

  // Rebuild cart from original order items
  const cartItems = original.items.map((item) => ({
    productId: new mongoose.Types.ObjectId(item.productId),
    title: item.title,
    image: item.image,
    price: item.price,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  }));

  await Cart.findOneAndUpdate(
    { userId },
    { userId, items: cartItems },
    { upsert: true, new: true, returnDocument: 'after' }
  );

  return { message: 'Items added to cart.', itemCount: cartItems.length };
}

// ─── Get order tracking detail ────────────────────────────────────────────────

export async function getOrderTracking(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw createError('Order not found.', 404, 'ORDER_NOT_FOUND');

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: order.statusHistory,
    estimatedDelivery: order.estimatedDelivery,
    shippingAddress: order.shippingAddress,
    deliveryAgent: order.deliveryAgent ?? null,
    shippingType: order.shippingType,
  };
}
