import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { createError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

export async function getWishlist(userId: string) {
  const items = await Wishlist.find({ userId }).populate('productId').sort({ createdAt: -1 });
  return items.map((item) => item.productId).filter(Boolean); // return product objects, ignoring nulls
}

export async function addToWishlist(userId: string, productId: string) {
  // Check product exists
  const product = await Product.findById(productId);
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');

  try {
    await Wishlist.create({ userId, productId });
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      throw createError('Product is already in your wishlist.', 409, 'ALREADY_WISHLISTED');
    }
    throw err;
  }
  return product;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const result = await Wishlist.deleteOne({
    userId,
    productId: new mongoose.Types.ObjectId(productId),
  });
  if (result.deletedCount === 0) {
    throw createError('Item not found in wishlist.', 404, 'NOT_IN_WISHLIST');
  }
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const items = await Wishlist.find({ userId }).select('productId');
  return items.map((i) => i.productId.toString());
}
