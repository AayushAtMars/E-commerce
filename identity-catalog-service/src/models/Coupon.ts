import mongoose, { Schema, Document } from 'mongoose';

export type DiscountType = 'percent' | 'flat';

export interface ICoupon extends Document {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;     // e.g. 10 → 10% or ₹10
  minOrderValue: number;
  maxDiscount?: number;      // cap for percent coupons
  expiresAt: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percent', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 999 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CouponSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => { ret.__v = undefined; return ret; },
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
