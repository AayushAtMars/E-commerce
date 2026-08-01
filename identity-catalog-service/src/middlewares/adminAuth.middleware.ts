import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { verifyAdminToken } from '../services/adminAuth.service';
import { AdminRole } from '../models/AdminUser';

import { AdminSession } from '../models/AdminSession';

// Extend Express Request to carry admin identity
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminId?: string;
      adminRole?: AdminRole;
      sessionId?: string;
    }
  }
}

/**
 * Verifies the admin JWT (Authorization: Bearer <token>).
 * Falls back to x-admin-api-key check for backward compatibility during transition.
 */
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 1. Try JWT Bearer token (new method)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyAdminToken(token);
      
      // Check session in database
      const session = await AdminSession.findById(payload.sessionId);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        res.status(401).json({ success: false, message: 'Session expired or revoked.', code: 'SESSION_REVOKED' });
        return;
      }

      req.adminId = payload.adminId;
      req.adminRole = payload.role;
      req.sessionId = payload.sessionId;
      return next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired admin token.', code: 'INVALID_TOKEN' });
      return;
    }
  }

  // 2. Fallback: x-admin-api-key (legacy, to be removed after dashboard migration)
  const apiKey = req.headers['x-admin-api-key'];
  if (apiKey && apiKey === env.ADMIN_API_KEY) {
    req.adminRole = 'super_admin'; // legacy key gets super_admin role
    return next();
  }

  res.status(401).json({ success: false, message: 'Admin authentication required.', code: 'UNAUTHORIZED' });
};

/**
 * Role guard middleware factory.
 * Usage: router.get('/sensitive', adminAuthMiddleware, requireRole('super_admin'), handler)
 */
export const requireRole = (...allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminRole || !allowedRoles.includes(req.adminRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
        code: 'FORBIDDEN',
      });
      return;
    }
    next();
  };
};
