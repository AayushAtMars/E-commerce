import { z } from 'zod';

export const addReviewSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  userAvatar: z.string().url().optional().or(z.literal('')),
  rating: z.number().min(1).max(5),
  text: z.string().min(1, 'Review text is required').max(1000),
  photos: z.array(z.string().url()).optional(),
}).strict();

export const reviewParamsSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
}).strict();
