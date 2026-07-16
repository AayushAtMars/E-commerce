import { z } from 'zod';

export const startChatSchema = z.object({
  partnerId: z.string().optional(),
  partner: z.string().optional(), // fallback used in controller
}).strict();

export const chatIdParamsSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
}).strict();

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message text is required').max(2000),
}).strict();
