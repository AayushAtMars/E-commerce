import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[DB] Connected to MongoDB (commerce-order-db)');
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }
}
