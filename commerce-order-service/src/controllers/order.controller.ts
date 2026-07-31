import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as orderService from '../services/order.service';

import axios from 'axios';
import { env } from '../config/env';

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { shippingAddress, shippingType, paymentMethod, promoCode } = req.body;
    
    // Fetch user profile from identity service
    let userEmail, userName;
    try {
      const profileRes = await axios.get(`${env.CATALOG_SERVICE_URL}/api/auth/me`, {
        headers: { Authorization: req.headers.authorization }
      });
      userEmail = profileRes.data.data.user.email;
      userName = profileRes.data.data.user.name;
    } catch (err: any) {
      console.warn('Failed to fetch user profile for email notifications:', err?.message || err);
    }

    const order = await orderService.createOrder({
      userId: req.userId!,
      userEmail,
      userName,
      shippingAddress,
      shippingType,
      paymentMethod,
      promoCode,
    });
    res.status(201).json({ success: true, message: 'Order placed successfully.', data: { order } });
  } catch (err) { next(err); }
}

export async function listOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const orders = await orderService.getUserOrders(req.userId!, status);
    res.json({ success: true, data: { orders } });
  } catch (err) { next(err); }
}

export async function getOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.userId!, String(req.params.id));
    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
}

export async function cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await orderService.cancelOrder(req.userId!, String(req.params.id));
    res.json({ success: true, message: 'Order cancelled.', data: { order } });
  } catch (err) { next(err); }
}

// Phase 4 — advance status (for demo/testing — in prod this would be a webhook or admin action)
export async function advanceStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await orderService.advanceOrderStatus(req.userId!, String(req.params.id));
    res.json({ success: true, message: `Status updated to "${order.status}".`, data: { order } });
  } catch (err) { next(err); }
}

// Phase 4 — reorder: rebuild cart from an existing order
export async function reorder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await orderService.reorder(req.userId!, String(req.params.id));
    res.json({ success: true, message: result.message, data: { itemCount: result.itemCount } });
  } catch (err) { next(err); }
}

// Phase 4 — tracking detail
export async function getTracking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tracking = await orderService.getOrderTracking(req.userId!, String(req.params.id));
    res.json({ success: true, data: { tracking } });
  } catch (err) { next(err); }
}

// ─── Returns ──────────────────────────────────────────────────────────────────

import * as returnService from '../services/return.service';

export async function createReturn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, type } = req.body;
    const returnReq = await returnService.createReturnRequest(req.userId!, String(req.params.id), items, type);
    res.status(201).json({ success: true, message: 'Return request submitted.', data: { returnReq } });
  } catch (err) { next(err); }
}

export async function listUserReturns(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const returns = await returnService.listUserReturns(req.userId!);
    res.json({ success: true, data: { returns } });
  } catch (err) { next(err); }
}
