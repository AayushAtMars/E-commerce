import { z } from 'zod';

export const addFundsSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
}).strict();

export const walletQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
}).strict();
