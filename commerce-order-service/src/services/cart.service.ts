import axios from 'axios';
import { Cart } from '../models/Cart';
import { createError } from '../middlewares/error.middleware';
import { env } from '../config/env';
import mongoose from 'mongoose';

interface ProductPrice {
  productId: string;
  price: number;
  originalPrice: number;
  stock: number;
  title: string;
  image?: string;
}

// Fetch fresh price + stock from Service A internal endpoint
async function fetchProductPrice(productId: string): Promise<ProductPrice> {
  try {
    const res = await axios.get(
      `${env.CATALOG_SERVICE_URL}/internal/products/${productId}/price`,
      { headers: { 'x-internal-key': env.INTERNAL_SERVICE_KEY }, timeout: 5000 }
    );
    return res.data.data as ProductPrice;
  } catch {
    throw createError('Could not verify product details. Try again.', 502, 'CATALOG_UNAVAILABLE');
  }
}

// ─── Get cart ─────────────────────────────────────────────────────────────────

export async function getCart(userId: string) {
  const cart = await Cart.findOne({ userId });
  return cart ?? { userId, items: [] };
}

// ─── Add / increment item ─────────────────────────────────────────────────────

export async function addItem(
  userId: string,
  input: { productId: string; size: string; color: string; quantity: number }
) {
  const { productId, size, color, quantity } = input;

  // Always re-fetch price from Service A
  const productData = await fetchProductPrice(productId);

  if (productData.stock < quantity) {
    throw createError(`Only ${productData.stock} units in stock.`, 409, 'INSUFFICIENT_STOCK');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingIdx = cart.items.findIndex(
    (i) => i.productId.toString() === productId && i.size === size && i.color === color
  );

  if (existingIdx >= 0) {
    const newQty = Math.min(50, cart.items[existingIdx].quantity + quantity);
    cart.items[existingIdx].quantity = newQty;
    cart.items[existingIdx].price = productData.price; // refresh price
  } else {
    cart.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      title: productData.title,
      image: productData.image || '',
      price: productData.price,
      size,
      color,
      quantity,
    });
  }

  await cart.save();
  return cart;
}

// ─── Add with image (from app-side cart that has image already) ───────────────

export async function syncCart(
  userId: string,
  items: { productId: string; title: string; image: string; size: string; color: string; quantity: number; price: number }[]
) {
  // Validate quantities and prices with Service A
  const validatedItems = await Promise.all(
    items.map(async (item) => {
      try {
        const pd = await fetchProductPrice(item.productId);
        return { ...item, price: pd.price, productId: new mongoose.Types.ObjectId(item.productId) };
      } catch {
        return { ...item, productId: new mongoose.Types.ObjectId(item.productId) };
      }
    })
  );

  const cart = await Cart.findOneAndUpdate(
    { userId },
    { userId, items: validatedItems },
    { upsert: true, new: true, returnDocument: 'after' }
  );
  return cart;
}

// ─── Update quantity ──────────────────────────────────────────────────────────

export async function updateItemQuantity(
  userId: string,
  productId: string,
  size: string,
  color: string,
  quantity: number
) {
  if (quantity < 1) {
    return removeItem(userId, productId, size, color);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) throw createError('Cart not found.', 404, 'CART_NOT_FOUND');

  const idx = cart.items.findIndex(
    (i) => i.productId.toString() === productId && i.size === size && i.color === color
  );
  if (idx < 0) throw createError('Item not in cart.', 404, 'ITEM_NOT_FOUND');

  cart.items[idx].quantity = Math.min(50, quantity);
  await cart.save();
  return cart;
}

// ─── Remove item ──────────────────────────────────────────────────────────────

export async function removeItem(userId: string, productId: string, size: string, color: string) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw createError('Cart not found.', 404, 'CART_NOT_FOUND');

  cart.items = cart.items.filter(
    (i) => !(i.productId.toString() === productId && i.size === size && i.color === color)
  );
  await cart.save();
  return cart;
}

// ─── Clear cart ───────────────────────────────────────────────────────────────

export async function clearCart(userId: string) {
  await Cart.findOneAndUpdate({ userId }, { items: [] });
}
