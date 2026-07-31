import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { seedDeliveryPartners } from '../seeds/seedDeliveryPartners';
import { DeliveryPartner } from '../models/DeliveryPartner';
import { Order } from '../models/Order';
import { ReturnStatus } from '../models/Return';
import * as returnService from '../services/return.service';
import { adminAuthMiddleware, requireRole } from '../middlewares/adminAuth.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { AuditLog } from '../models/AuditLog';
import { sendOrderStatusEmail } from '../services/email.service';

const router = Router();

router.use(adminAuthMiddleware);
router.use(auditMiddleware);

// ─── Delivery partner management (internal/seed use) ─────────────────────────

router.post('/seed-delivery-partners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await seedDeliveryPartners();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/delivery-partners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await DeliveryPartner.find().sort({ ordersCount: 1 });
    res.json({ success: true, data: { partners, count: partners.length } });
  } catch (err) { next(err); }
});

router.delete('/delivery-partners/reset-counts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await DeliveryPartner.updateMany({}, { $set: { ordersCount: 0 } });
    res.json({ success: true, message: 'Round-robin counters reset.' });
  } catch (err) { next(err); }
});

router.post('/fix-old-orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await Order.updateMany({}, { $unset: { deliveryAgent: "" } });
    await DeliveryPartner.updateMany({}, { $set: { ordersCount: 0 } });
    const ordersToFix = await Order.find({ status: { $in: ['On the Way', 'Delivered'] } });
    let fixed = 0;
    for (const o of ordersToFix) {
      const partner = await DeliveryPartner.findOneAndUpdate(
        { isActive: true },
        { $inc: { ordersCount: 1 } },
        { sort: { ordersCount: 1, _id: 1 }, new: false }
      );
      if (partner) {
        o.deliveryAgent = {
          _id: partner._id.toString(),
          name: partner.name,
          phone: partner.phone,
          avatar: partner.avatar,
          vehicle: partner.vehicle,
          rating: partner.rating,
        };
        await o.save();
        fixed++;
      }
    }
    res.json({ success: true, message: `Cleared mock agents. Reassigned ${fixed} active orders.` });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/orders — list all orders with optional filters ─────────────
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, data: { orders, count: total, page, limit } });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/orders/:id — single order detail ─────────────────────────
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }
    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/orders/:id/status — admin update order status ───────────
const statusSchema = z.object({
  status: z.enum(['Placed', 'In Progress', 'On the Way', 'Delivered', 'Cancelled']),
  note: z.string().optional(),
});

router.patch('/orders/:id/status', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid status.', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    const { status, note } = parsed.data;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note ?? `Status updated to "${status}" by admin.`,
    });
    await order.save();

    // Send email on admin status change
    if (order.userEmail && order.userName) {
      sendOrderStatusEmail(order.userEmail, order.userName, order, status).catch(err => {
        console.error(`[Email] Failed to send order status email for ${order.orderNumber}:`, err);
      });
    }

    res.json({ success: true, data: { order }, message: `Order status updated to "${status}".` });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/orders/:id/shipment — admin update order shipment ───────────
const shipmentSchema = z.object({
  trackingId: z.string().min(1),
  carrier: z.string().min(1),
  trackingUrl: z.string().optional(),
});

router.patch('/orders/:id/shipment', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = shipmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid shipment data.', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }

    order.shipment = {
      ...parsed.data,
      shippedAt: new Date(),
    };
    
    // Auto-advance status if it was in an earlier state
    if (order.status === 'Placed' || order.status === 'In Progress') {
      order.status = 'On the Way';
      order.statusHistory.push({
        status: 'On the Way',
        timestamp: new Date(),
        note: `Shipment added: ${parsed.data.carrier} - ${parsed.data.trackingId}`,
      });
    }
    
    await order.save();
    res.json({ success: true, data: { order }, message: 'Shipment details added.' });
  } catch (err) { next(err); }
});

// ─── Returns ──────────────────────────────────────────────────────────────────

router.get('/returns', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await returnService.adminListReturns(filters);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

const updateReturnSchema = z.object({
  status: z.enum(['Requested', 'Approved', 'Rejected', 'Completed']),
  note: z.string().optional(),
});

router.patch('/returns/:id', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateReturnSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid status.', code: 'VALIDATION_ERROR' });
      return;
    }
    
    const returnReq = await returnService.adminUpdateReturn(
      String(req.params.id),
      parsed.data.status as ReturnStatus,
      parsed.data.note
    );
    res.json({ success: true, data: { returnRequest: returnReq } });
  } catch (err) { next(err); }
});

router.get('/audit-logs', requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '50');
    const logs = await AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await AuditLog.countDocuments();
    res.json({ success: true, data: { logs, total, page, limit } });
  } catch (err) {
    next(err);
  }
});

export default router;
