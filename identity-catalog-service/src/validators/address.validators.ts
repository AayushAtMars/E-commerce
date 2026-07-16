import { z } from 'zod';

export const addressIdParamsSchema = z.object({
  id: z.string().min(1, 'Address ID is required'),
}).strict();

export const createAddressSchema = z.object({
  label: z.union([
    z.literal('Home'),
    z.literal('Office'),
    z.literal("Parent's House"),
    z.literal("Friend's House")
  ]),
  line1: z.string().min(1, 'Street address is required').max(200),
  floor: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().max(100).default('India').optional(),
  pincode: z.string().min(1, 'Pincode is required').max(20),
  isDefault: z.boolean().optional(),
}).strict();

export const updateAddressSchema = createAddressSchema.partial().strict();
