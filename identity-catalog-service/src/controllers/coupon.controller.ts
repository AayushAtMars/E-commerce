import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as couponService from '../services/coupon.service';

export async function listCoupons(_req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await couponService.listCoupons();
    res.json({ success: true, data: { coupons } });
  } catch (err) { next(err); }
}

export async function validateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code, subtotal } = req.body;
    const result = await couponService.validateCoupon(code, Number(subtotal));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function recordCouponUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.body;
    await couponService.recordCouponUsage(code);
    res.json({ success: true, message: 'Coupon usage recorded' });
  } catch (err) { next(err); }
}

export async function seedCoupons(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await couponService.seedCoupons();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
