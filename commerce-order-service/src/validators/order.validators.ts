import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    title: z.string().optional(),
    recipientName: z.string().min(1),
    phone: z.string().min(1),
    streetAddress: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
  }).strict(),
  shippingType: z.enum(['Standard', 'Express', 'NextDay']).optional(),
  paymentMethod: z.enum(['CreditCard', 'ApplePay', 'GooglePay', 'PayPal', 'Wallet']).optional(),
  promoCode: z.string().optional(),
}).strict();

export const orderIdParamsSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
}).strict();

export const getOrdersQuerySchema = z.object({
  status: z.string().optional(),
}).strict();
