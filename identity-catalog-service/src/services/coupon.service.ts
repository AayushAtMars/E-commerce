import { Coupon } from '../models/Coupon';
import { createError } from '../middlewares/error.middleware';

// ─── List all active coupons ──────────────────────────────────────────────────

export async function listCoupons() {
  return Coupon.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
  }).sort({ expiresAt: 1 });
}

export async function adminListCoupons(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  const [coupons, total] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coupon.countDocuments(),
  ]);
  return { coupons, total, page, limit };
}

export async function createCoupon(data: any) {
  if (data.code) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase().trim() });
    if (existing) throw createError('Coupon code already exists', 400, 'DUPLICATE_CODE');
    data.code = data.code.toUpperCase().trim();
  }
  const coupon = new Coupon(data);
  await coupon.save();
  return coupon;
}

export async function updateCoupon(id: string, data: any) {
  if (data.code) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase().trim(), _id: { $ne: id } });
    if (existing) throw createError('Coupon code already exists', 400, 'DUPLICATE_CODE');
    data.code = data.code.toUpperCase().trim();
  }
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!coupon) throw createError('Coupon not found', 404, 'NOT_FOUND');
  return coupon;
}

export async function deactivateCoupon(id: string) {
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
  if (!coupon) throw createError('Coupon not found', 404, 'NOT_FOUND');
  return coupon;
}

// ─── Validate coupon (called from app before checkout) ───────────────────────

export async function validateCoupon(code: string, orderSubtotal: number) {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  if (!coupon) throw createError('Coupon not found or expired.', 404, 'COUPON_NOT_FOUND');
  if (coupon.usedCount >= coupon.usageLimit) {
    throw createError('Coupon usage limit reached.', 409, 'COUPON_EXHAUSTED');
  }
  if (orderSubtotal < coupon.minOrderValue) {
    throw createError(
      `Minimum order value for this coupon is ₹${coupon.minOrderValue}.`,
      400,
      'MIN_ORDER_NOT_MET'
    );
  }

  let discountAmount: number;
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = coupon.discountValue;
  }

  return {
    coupon,
    discountAmount,
    finalSubtotal: Math.max(0, orderSubtotal - discountAmount),
  };
}

// ─── Record usage (called from Service B after order creation) ────────────────

export async function recordCouponUsage(code: string) {
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    { $inc: { usedCount: 1 } }
  );
}

// ─── Seed coupons (call once) ─────────────────────────────────────────────────

export async function seedCoupons() {
  const existing = await Coupon.countDocuments();
  if (existing > 0) return { message: 'Coupons already seeded.', count: existing };

  const coupons = [
    {
      code: 'WELCOME20',
      title: 'Welcome Offer',
      description: '20% off your first order',
      discountType: 'percent' as const,
      discountValue: 20,
      minOrderValue: 500,
      maxDiscount: 300,
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      usageLimit: 1000,
    },
    {
      code: 'FLAT100',
      title: 'Flat ₹100 Off',
      description: '₹100 off on orders above ₹999',
      discountType: 'flat' as const,
      discountValue: 100,
      minOrderValue: 999,
      expiresAt: new Date(Date.now() + 15 * 86_400_000),
      usageLimit: 500,
    },
    {
      code: 'FASHION10',
      title: 'Fashion Day',
      description: '10% off on all fashion items',
      discountType: 'percent' as const,
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: 200,
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
      usageLimit: 999,
    },
    {
      code: 'SAVE20',
      title: 'Super Saver',
      description: 'Flat ₹20 off on any order',
      discountType: 'flat' as const,
      discountValue: 20,
      minOrderValue: 0,
      expiresAt: new Date(Date.now() + 60 * 86_400_000),
      usageLimit: 999,
    },
    {
      code: 'SUMMER30',
      title: 'Summer Sale',
      description: '30% off on orders above ₹1500',
      discountType: 'percent' as const,
      discountValue: 30,
      minOrderValue: 1500,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 10 * 86_400_000),
      usageLimit: 200,
    },
  ];

  await Coupon.insertMany(coupons);
  return { message: 'Coupons seeded.', count: coupons.length };
}
