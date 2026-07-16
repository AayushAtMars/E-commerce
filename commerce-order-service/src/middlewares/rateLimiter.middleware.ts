import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

const publicLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_PUBLIC_MAX,
  duration: 15 * 60,
});

const userLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_USER_MAX,
  duration: 15 * 60,
});

const authLimiter = new RateLimiterMemory({
  points: 10000,
  duration: 15 * 60,
});

export const publicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  publicLimiter.consume(req.ip as string)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ success: false, message: 'Too many requests from this IP, please try again later.', code: 'RATE_LIMITED' });
    });
};

export const userRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = (req as any).user?.id || req.ip;
  userLimiter.consume(key as string)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ success: false, message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' });
    });
};

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.body?.email || req.body?.username || 'unknown';
  const key = `${req.ip}_${accountId}`;
  
  authLimiter.consume(key)
    .then((rateLimiterRes) => {
      const consumedPoints = rateLimiterRes.consumedPoints;
      const maxAttempts = env.RATE_LIMIT_AUTH_MAX;
      
      if (consumedPoints > maxAttempts) {
        const excess = consumedPoints - maxAttempts;
        const delayMs = Math.min(Math.pow(2, excess) * 1000, 30000);
        
        setTimeout(() => {
           next();
        }, delayMs);
      } else {
        next();
      }
    })
    .catch(() => {
      res.status(429).json({ success: false, message: 'Too many authentication attempts. Please try again later.', code: 'RATE_LIMITED' });
    });
};
