import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  adminLoginService,
  verifyHCaptcha,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  logoutSessionService,
  revokeSessionService,
  listActiveSessions,
} from '../services/adminAuth.service';
import { adminAuthMiddleware, requireRole } from '../middlewares/adminAuth.middleware';
import { AdminUser } from '../models/AdminUser';

const router = Router();

// ─── POST /api/admin/auth/login ───────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  captchaToken: z.string().optional(),
});

router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid input.', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    const { email, password, captchaToken } = parsed.data;

    // Verify CAPTCHA (skipped in dev if HCAPTCHA_SECRET is 'dev_skip')
    if (captchaToken) {
      await verifyHCaptcha(captchaToken);
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    const { token, admin } = await adminLoginService(email, password, ipAddress, userAgent);
    res.json({ success: true, data: { token, admin } });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/auth/me ───────────────────────────────────────────────────
router.get('/auth/me', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await AdminUser.findById(req.adminId);
    if (!admin) { res.status(404).json({ success: false, message: 'Admin not found.', code: 'NOT_FOUND' }); return; }
    res.json({ success: true, data: { admin } });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/auth/logout ─────────────────────────────────────────────
router.post('/auth/logout', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.sessionId) {
      await logoutSessionService(req.sessionId);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/auth/sessions ────────────────────────────────────────────
router.get('/auth/sessions', adminAuthMiddleware, requireRole('super_admin'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await listActiveSessions();
    res.json({ success: true, data: { sessions, count: sessions.length } });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/auth/sessions/:sessionId/revoke ────────────────────────
router.post('/auth/sessions/:sessionId/revoke', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await revokeSessionService(String(req.params.sessionId));
    res.json({ success: true, message: 'Session revoked successfully.' });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/auth/admins — List all admin users ───────────────────────
router.get('/auth/admins', adminAuthMiddleware, requireRole('super_admin'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await listAdminUsers();
    res.json({ success: true, data: { admins, count: admins.length } });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/auth/admins — Create admin user ────────────────────────
const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'order_manager', 'support']),
});

router.post('/auth/admins', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid input.', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    const admin = await createAdminUser(parsed.data);
    res.status(201).json({ success: true, data: { admin } });
  } catch (err) { next(err); }
});

// ─── PATCH /api/admin/auth/admins/:id — Update admin user ────────────────────
const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['super_admin', 'order_manager', 'support']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

router.patch('/auth/admins/:id', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid input.', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    const admin = await updateAdminUser(String(req.params.id), parsed.data);
    res.json({ success: true, data: { admin } });
  } catch (err) { next(err); }
});

export default router;
