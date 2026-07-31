import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicRateLimiter, userRateLimiter } from './middlewares/rateLimiter.middleware';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import productRoutes, { internalProductRouter } from './routes/product.routes';
import wishlistRoutes from './routes/wishlist.routes';
import reviewRoutes from './routes/review.routes';
import addressRoutes from './routes/address.routes';
import profileRoutes from './routes/profile.routes';
import couponRoutes from './routes/coupon.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import adminAuthRoutes from './routes/adminAuth.routes';
import { ticketRoutes } from './routes/ticket.routes';
import { seedSuperAdmin } from './services/adminAuth.service';
import settingsRoutes from './routes/settings.routes';

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*' })); // Restrict to specific origins in prod
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global limiter removed in favor of route-specific limiters

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'identity-catalog-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', publicRateLimiter, productRoutes);
app.use('/api/products/:productId/reviews', userRateLimiter, reviewRoutes);
app.use('/api/wishlist', userRateLimiter, wishlistRoutes);
app.use('/api/addresses', userRateLimiter, addressRoutes);
app.use('/api/profile', userRateLimiter, profileRoutes);
app.use('/api/coupons', publicRateLimiter, couponRoutes);
app.use('/api/upload', userRateLimiter, uploadRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', userRateLimiter, ticketRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/internal', internalProductRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();
  await seedSuperAdmin();
  app.listen(env.PORT, () => {
    console.log(`[identity-catalog-service] Running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
