import { z } from 'zod';

export const addressIdParamsSchema = z.object({
  id: z.string().min(1, 'Address ID is required'),
}).strict();

export const createAddressSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  streetAddress: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().min(1, 'Country is required').max(100).default('US'),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  isDefault: z.boolean().optional(),
}).strict();

export const updateAddressSchema = createAddressSchema.partial().strict();
