import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

declare global {
  namespace Express {
    interface Request {
      adminName?: string;
    }
  }
}

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        let action = req.method;
        let resourceType = req.baseUrl.split('/').pop() || 'unknown';
        if (req.path !== '/') {
          resourceType += req.path.replace(/\//g, '_');
        }

        const log = new AuditLog({
          adminId: req.adminId || 'unknown',
          adminName: req.adminName || 'System',
          action,
          resourceType,
          resourceId: req.params.id || req.body?.id || undefined,
          details: req.body ? JSON.stringify(req.body) : undefined,
        });

        log.save().catch((err) => {
          console.error('Failed to save audit log:', err);
        });
      }
    });
  }
  next();
};
