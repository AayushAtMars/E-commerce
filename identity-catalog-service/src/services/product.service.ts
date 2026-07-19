import { Product, IProduct } from '../models/Product';
import { Wishlist } from '../models/Wishlist';
import { createError } from '../middlewares/error.middleware';

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sizes?: string[];
  colors?: string[];
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

// ─── List products with filtering + pagination ────────────────────────────────

export async function listProducts(filter: ProductFilter) {
  const {
    category,
    minPrice,
    maxPrice,
    minRating,
    sizes,
    colors,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = filter;

  const query: Record<string, unknown> = {};

  if (category) query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
  }
  if (minRating !== undefined) query.rating = { $gte: minRating };
  if (sizes?.length) query.sizes = { $in: sizes };
  if (colors?.length) query.colors = { $in: colors };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortQuery = sortMap[sort] ?? sortMap.newest;

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(query).sort(sortQuery).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    data: products,
    total,
    page,
    limit,
    hasMore: skip + products.length < total,
  };
}

// ─── Search products ──────────────────────────────────────────────────────────

export async function searchProducts(q: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Product.countDocuments({ $text: { $search: q } }),
  ]);

  return { data: products, total, page, limit, hasMore: skip + products.length < total };
}

// ─── Get single product ───────────────────────────────────────────────────────

export async function getProductById(productId: string) {
  const product = await Product.findById(productId);
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return product;
}

// ─── Featured sections ────────────────────────────────────────────────────────

export async function getFeaturedProducts() {
  const [flashSale, bestSellers] = await Promise.all([
    Product.find({ isFlashSale: true }).sort({ rating: -1 }).limit(10),
    Product.find({ isBestSeller: true }).sort({ reviewCount: -1 }).limit(10),
  ]);
  return { flashSale, bestSellers };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const categories = await Product.distinct('category');
  return categories.sort();
}

// ─── Internal price check (called by Service B) ───────────────────────────────

export async function getProductPriceInternal(productId: string) {
  const product = await Product.findById(productId).select('price discountPrice stock title');
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return {
    productId: product._id.toString(),
    price: product.discountPrice ?? product.price,
    originalPrice: product.price,
    stock: product.stock,
    title: product.title,
  };
}

// ─── Create Product (Admin) ───────────────────────────────────────────────────

export async function createProduct(productData: Partial<IProduct>) {
  const product = new Product(productData);
  await product.save();
  return product;
}
