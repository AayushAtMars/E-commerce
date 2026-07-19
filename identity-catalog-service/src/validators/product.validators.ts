import { z } from 'zod';

export const productIdParamsSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
}).strict();

export const searchProductsQuerySchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
}).strict();

export const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
}).strict();

export const createProductBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  sellerName: z.string().min(1, 'Seller name is required'),
  sellerAvatar: z.string().optional(),
  sellerRole: z.string().optional(),
  isFlashSale: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  stock: z.number().min(0).optional(),
}).strict();
