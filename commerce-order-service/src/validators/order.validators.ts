import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    label: z.string().min(1),
    line1: z.string().min(1),
    floor: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().optional(),
    pincode: z.string().min(1),
  }).strict(),
  shippingType: z.enum(['Economy', 'Cargo', 'Express']).optional(),
  paymentMethod: z.enum(['Cash', 'Wallet', 'Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'UPI', 'Credit/Debit Card', 'Netbanking', 'Cash on Delivery']).optional(),
  promoCode: z.string().optional(),
}).strict();

export const orderIdParamsSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
}).strict();

export const getOrdersQuerySchema = z.object({
  status: z.string().optional(),
}).strict();

export const createReturnSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    reason: z.string().min(5),
  })).min(1, 'At least one item is required'),
  type: z.enum(['Refund', 'Replacement']),
}).strict();
