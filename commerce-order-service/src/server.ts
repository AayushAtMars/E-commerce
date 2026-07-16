import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicRateLimiter, userRateLimiter } from './middlewares/rateLimiter.middleware';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorMiddleware } from './middlewares/error.middleware';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import walletRoutes from './routes/wallet.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import { seedDeliveryPartners } from './seeds/seedDeliveryPartners';

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
    service: 'commerce-order-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/cart', userRateLimiter, cartRoutes);
app.use('/api/orders', userRateLimiter, orderRoutes);
app.use('/api/wallet', userRateLimiter, walletRoutes);
app.use('/api/admin', userRateLimiter, adminRoutes);
app.use('/api/chat', userRateLimiter, chatRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();

  // Auto-seed delivery partners if not already present
  await seedDeliveryPartners();

  app.listen(env.PORT, () => {
    console.log(`[commerce-order-service] Running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
