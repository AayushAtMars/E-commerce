import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { createError } from '../middlewares/error.middleware';

export async function getProductReviews(productId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ productId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments({ productId }),
  ]);
  return { data: reviews, total, page, limit, hasMore: skip + reviews.length < total };
}

export async function createReview(data: {
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  photos?: string[];
}) {
  // Check product exists
  const product = await Product.findById(data.productId);
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');

  let review;
  try {
    review = await Review.create(data);
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      throw createError('You have already reviewed this product.', 409, 'ALREADY_REVIEWED');
    }
    throw err;
  }

  // Recalculate product rating + reviewCount
  const stats = await Review.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await Product.findByIdAndUpdate(data.productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  return review;
}
