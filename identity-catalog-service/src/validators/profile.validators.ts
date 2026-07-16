import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64).optional(),
  phone: z.string().max(20).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z.string().optional(),
  avatarUrl: z.string().url().optional(),
}).strict();

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
}).strict();

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
}).strict();

export const updateNotificationPrefsSchema = z.object({
  emailPromotions: z.boolean().optional(),
  smsOrders: z.boolean().optional(),
  pushOffers: z.boolean().optional(),
}).strict();
