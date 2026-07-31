import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
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

  const query: Record<string, unknown> = { isVisible: { $ne: false } }; // Public: show visible or legacy (undefined) products

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
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  return categories.map(c => c.name);
}

// ─── Internal price check (called by Service B) ───────────────────────────────

export async function getProductPriceInternal(productId: string) {
  const product = await Product.findById(productId).select('price discountPrice stock title images');
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return {
    productId: product._id.toString(),
    price: product.discountPrice ?? product.price,
    originalPrice: product.price,
    stock: product.stock,
    title: product.title,
    image: product.images?.[0] || '',
  };
}

// ─── Create Product (Admin) ───────────────────────────────────────────────────

export async function createProduct(productData: Partial<IProduct>) {
  const product = new Product(productData);
  await product.save();
  return product;
}

// ─── Update Product (Admin) ───────────────────────────────────────────────────

export async function updateProduct(productId: string, data: Partial<IProduct>) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: data },
    { new: true, runValidators: true, returnDocument: 'after' }
  );
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return product;
}

// ─── Toggle Product Visibility (Admin) ────────────────────────────────────────

export async function toggleProductVisibility(productId: string) {
  const product = await Product.findById(productId);
  if (!product) throw createError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  product.isVisible = !product.isVisible;
  await product.save();
  return product;
}

// ─── Bulk Toggle Visibility (Admin) ───────────────────────────────────────────

export async function bulkToggleVisibility(productIds: string[], isVisible: boolean) {
  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { isVisible } }
  );
  return { modifiedCount: result.modifiedCount };
}
