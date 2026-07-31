import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { createError } from './error.middleware';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createError('No token provided', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;

    // Async block check — fire and forget pattern: check if user is blocked
    User.findById(decoded.userId).select('isBlocked').lean().then((user) => {
      if (!user) return next(createError('User not found', 404, 'USER_NOT_FOUND'));
      if ((user as { isBlocked?: boolean }).isBlocked) {
        return next(createError('Your account has been blocked. Please contact support.', 403, 'USER_BLOCKED'));
      }
      next();
    }).catch(() => next()); // On DB error, allow through (fail open for availability)

  } catch {
    next(createError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

// Internal service-to-service auth (Service B calling Service A)
export function internalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const key = req.headers['x-internal-key'];
  if (key !== env.INTERNAL_SERVICE_KEY) {
    return next(createError('Forbidden', 403, 'FORBIDDEN'));
  }
  next();
}
