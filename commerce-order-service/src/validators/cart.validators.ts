import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
}).strict();

export const addItemSchema = cartItemSchema;

export const updateQuantitySchema = cartItemSchema;

export const removeItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().optional(),
  color: z.string().optional(),
}).strict();

export const syncCartSchema = z.object({
  items: z.array(cartItemSchema).optional(),
}).strict();
