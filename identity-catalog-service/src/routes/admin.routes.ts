import { Router, Request, Response, NextFunction } from 'express';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { User } from '../models/User';

const router = Router();

// GET /api/admin/users — fetch all users
router.get('/users', adminAuthMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { users, count: users.length } });
  } catch (err) { next(err); }
});

export default router;
