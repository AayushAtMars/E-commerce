import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as ticketService from '../services/ticket.service';
import { adminAuthMiddleware, requireRole } from '../middlewares/adminAuth.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.use(adminAuthMiddleware);
router.use(auditMiddleware);

// ─── GET /api/admin/users — fetch all users (paginated) ──────────────────────
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ success: true, data: { users, count: total, page, limit } });
  } catch (err) { next(err); }
});

// ─── TICKETS ─────────────────────────────────────────────────────────────────

router.get(
  '/tickets',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await ticketService.adminListTickets({
        status: req.query.status as string,
        priority: req.query.priority as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      });
      res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/tickets/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.getTicketById(String(req.params.id));
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/tickets/:id/message',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = z.object({ text: z.string().min(1) }).parse(req.body);
      const ticket = await ticketService.addMessage(
        String(req.params.id),
        parsed.text,
        'Support Admin',
        true
      );
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/tickets/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = z.object({
        status: z.enum(['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed']).optional(),
        priority: z.enum(['Low', 'Medium', 'High']).optional(),
      }).parse(req.body);
      
      const ticket = await ticketService.adminUpdateTicket(String(req.params.id), parsed);
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/users/:id — fetch single user ────────────────────────────
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found.', code: 'USER_NOT_FOUND' }); return; }
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/users/:id/block ────────────────────────────────────────
const blockSchema = z.object({ reason: z.string().min(5, 'Reason must be at least 5 characters.') });

router.patch('/users/:id/block', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = blockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked: true, blockReason: parsed.data.reason } },
      { new: true, returnDocument: 'after' }
    );
    if (!user) { res.status(404).json({ success: false, message: 'User not found.', code: 'USER_NOT_FOUND' }); return; }
    res.json({ success: true, data: { user }, message: 'User blocked successfully.' });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/users/:id/unblock ─────────────────────────────────────
router.patch('/users/:id/unblock', requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked: false }, $unset: { blockReason: '' } },
      { new: true, returnDocument: 'after' }
    );
    if (!user) { res.status(404).json({ success: false, message: 'User not found.', code: 'USER_NOT_FOUND' }); return; }
    res.json({ success: true, data: { user }, message: 'User unblocked successfully.' });
  } catch (err) { next(err); }
});

import * as categoryService from '../services/category.service';
import * as couponService from '../services/coupon.service';

// ─── Categories ──────────────────────────────────────────────────────────────
router.get('/categories', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.listCategories(true);
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
});

router.post('/categories', adminAuthMiddleware, requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) { next(err); }
});

router.patch('/categories/:id', adminAuthMiddleware, requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(String(req.params.id), req.body);
    res.json({ success: true, data: { category } });
  } catch (err) { next(err); }
});

router.patch('/categories/:id/visibility', adminAuthMiddleware, requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.toggleCategoryVisibility(String(req.params.id));
    res.json({ success: true, data: { category } });
  } catch (err) { next(err); }
});

// ─── Coupons ─────────────────────────────────────────────────────────────────
router.get('/coupons', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const result = await couponService.adminListCoupons(page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/coupons', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: { coupon } });
  } catch (err) { next(err); }
});

router.patch('/coupons/:id', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.updateCoupon(String(req.params.id), req.body);
    res.json({ success: true, data: { coupon } });
  } catch (err) { next(err); }
});

router.delete('/coupons/:id', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.deactivateCoupon(String(req.params.id));
    res.json({ success: true, data: { coupon } });
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
