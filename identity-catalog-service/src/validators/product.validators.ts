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
