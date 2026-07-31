import mongoose from 'mongoose';
import { Return, IReturnItem, ReturnType, ReturnStatus } from '../models/Return';
import { Order } from '../models/Order';
import { createError } from '../middlewares/error.middleware';
import { refundWallet } from './wallet.service';

// ─── Create Return Request (User) ──────────────────────────────────────────────

export async function createReturnRequest(
  userId: string,
  orderId: string,
  items: IReturnItem[],
  type: ReturnType
) {
  const order = await Order.findOne({ _id: orderId, userId: new mongoose.Types.ObjectId(userId) });
  if (!order) {
    throw createError('Order not found or does not belong to you.', 404, 'ORDER_NOT_FOUND');
  }

  // Business logic: only allow returns for delivered orders
  if (order.status !== 'Delivered') {
    throw createError('Return request can only be created for delivered orders.', 400, 'ORDER_NOT_DELIVERED');
  }

  // Enforce 5-day return window
  const deliveredStatus = order.statusHistory.find(h => h.status === 'Delivered');
  if (deliveredStatus) {
    const deliveredDate = new Date(deliveredStatus.timestamp).getTime();
    const now = Date.now();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    if (now - deliveredDate > fiveDaysInMs) {
      throw createError('The 5-day return window for this order has expired.', 400, 'RETURN_WINDOW_EXPIRED');
    }
  }

  // Validate items against order
  for (const item of items) {
    const orderItem = order.items.find((oi) => oi.productId === item.productId);
    if (!orderItem) {
      throw createError(`Item ${item.productId} is not part of this order.`, 400, 'INVALID_RETURN_ITEM');
    }
    if (item.quantity > orderItem.quantity) {
      throw createError(`Return quantity for ${item.productId} exceeds order quantity.`, 400, 'INVALID_RETURN_QUANTITY');
    }
  }

  // Check if a return already exists for this order
  const existingReturn = await Return.findOne({ orderId, userId });
  if (existingReturn) {
    throw createError('A return request already exists for this order.', 400, 'RETURN_ALREADY_EXISTS');
  }

  const returnReq = new Return({
    orderId,
    userId,
    items,
    type,
    status: 'Requested',
  });

  await returnReq.save();
  return returnReq;
}

// ─── List User Returns ────────────────────────────────────────────────────────

export async function listUserReturns(userId: string) {
  return Return.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate('orderId', 'orderNumber status')
    .sort({ createdAt: -1 });
}

// ─── Admin List Returns ───────────────────────────────────────────────────────

export async function adminListReturns(filters: any) {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;

  const page = filters.page ? parseInt(filters.page, 10) : 1;
  const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
  const skip = (page - 1) * limit;

  const [returns, total] = await Promise.all([
    Return.find(query)
      .populate('orderId', 'orderNumber status total')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Return.countDocuments(query),
  ]);

  return { data: returns, total, page, limit };
}

// ─── Admin Update Return Status ───────────────────────────────────────────────

export async function adminUpdateReturn(
  returnId: string,
  status: ReturnStatus,
  note?: string
) {
  const returnReq = await Return.findById(returnId);
  if (!returnReq) {
    throw createError('Return request not found.', 404, 'RETURN_NOT_FOUND');
  }

  // Only allow valid transitions (e.g. Requested -> Approved/Rejected, Approved -> Completed)
  if (returnReq.status === 'Completed' || returnReq.status === 'Rejected') {
    throw createError(`Cannot update a ${returnReq.status} return request.`, 400, 'INVALID_RETURN_STATUS');
  }

  returnReq.status = status;
  if (note) {
    returnReq.note = note;
  }
  await returnReq.save();

  // If approved and it's a refund, calculate amount and refund to wallet
  if (status === 'Approved' && returnReq.type === 'Refund') {
    const order = await Order.findById(returnReq.orderId);
    if (order) {
      // Calculate refund amount based on items
      let refundAmount = 0;
      for (const item of returnReq.items) {
        const orderItem = order.items.find(oi => oi.productId === item.productId);
        if (orderItem) {
          refundAmount += orderItem.price * item.quantity;
        }
      }
      
      // We apply any order-level discount proportionally (optional logic)
      // but for simplicity, let's refund the raw sum or cap it at order total
      if (refundAmount > order.total) refundAmount = order.total;
      
      if (refundAmount > 0) {
        await refundWallet(
          returnReq.userId.toString(),
          refundAmount,
          order._id.toString(),
          `Refund for returned items (Return ID: ${returnReq._id})`
        );
      }
    }
  }

  return returnReq;
}
