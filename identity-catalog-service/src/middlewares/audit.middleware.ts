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
  // We only log mutating actions
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Wait for the response to finish so we know if it succeeded
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        // Build the audit log
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
