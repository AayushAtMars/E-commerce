import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-admin-api-key'];
  
  console.log('[DEBUG] Received API Key:', apiKey);
  console.log('[DEBUG] Expected API Key:', env.ADMIN_API_KEY);

  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin API Key', code: 'UNAUTHORIZED' });
    return;
  }

  next();
};
