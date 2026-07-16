import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as orderService from '../services/order.service';

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { shippingAddress, shippingType, paymentMethod, promoCode } = req.body;
    const order = await orderService.createOrder({
      userId: req.userId!,
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
