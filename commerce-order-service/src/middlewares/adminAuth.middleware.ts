import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AdminRole = 'super_admin' | 'order_manager' | 'support';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminId?: string;
      adminRole?: AdminRole;
    }
  }
}

/**
 * Verifies admin JWT issued by identity-catalog-service.
 * Falls back to x-admin-api-key for legacy compatibility.
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Try JWT Bearer token (new method)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as { adminId: string; role: AdminRole };
      req.adminId = payload.adminId;
      req.adminRole = payload.role;
      return next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired admin token.', code: 'INVALID_TOKEN' });
      return;
    }
  }

  // 2. Fallback: x-admin-api-key (legacy)
  const apiKey = req.headers['x-admin-api-key'];
  if (apiKey && apiKey === env.ADMIN_API_KEY) {
    req.adminRole = 'super_admin';
    return next();
  }

  res.status(401).json({ success: false, message: 'Admin authentication required.', code: 'UNAUTHORIZED' });
};

/**
 * Role guard middleware factory.
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
