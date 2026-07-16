import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
}).strict();

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(4, 'OTP must be 4 digits'),
  purpose: z.enum(['signup', 'forgotPassword']),
}).strict();

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['signup', 'forgotPassword']),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
}).strict();

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(4, 'OTP must be 4 digits'),
  newPassword: passwordSchema,
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}).strict();

export const completeProfileSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  phone: z.string().max(20).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z.string().optional(),
  avatarUrl: z.string().url().optional(),
}).strict();
