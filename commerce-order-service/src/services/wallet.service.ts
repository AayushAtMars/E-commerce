import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet';
import { createError } from '../middlewares/error.middleware';

const TOP_UP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

// ─── Get or create wallet ─────────────────────────────────────────────────────

async function getOrCreate(userId: string) {
  return Wallet.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), balance: 0, transactions: [] } },
    { upsert: true, new: true, returnDocument: 'after' }
  );
}

// ─── Get wallet ───────────────────────────────────────────────────────────────

export async function getWallet(userId: string) {
  return getOrCreate(userId);
}

// ─── Top up wallet ────────────────────────────────────────────────────────────

export async function topUp(userId: string, amount: number) {
  if (!TOP_UP_AMOUNTS.includes(amount)) {
    throw createError(
      `Invalid top-up amount. Allowed: ${TOP_UP_AMOUNTS.join(', ')}`,
      400,
      'INVALID_TOP_UP_AMOUNT'
    );
  }

  const wallet = await getOrCreate(userId);
  wallet.balance += amount;
  wallet.transactions.push({
    type: 'credit',
    amount,
    source: 'top_up',
    description: `Wallet topped up with ₹${amount}`,
    createdAt: new Date(),
  });
  await wallet.save();
  return wallet;
}

// ─── Debit (used internally when paying by wallet) ────────────────────────────

export async function debitWallet(
  userId: string,
  amount: number,
  orderId: string,
  description: string
) {
  const wallet = await getOrCreate(userId);
  if (wallet.balance < amount) {
    throw createError(
      `Insufficient wallet balance. Available: ₹${wallet.balance}`,
      400,
      'INSUFFICIENT_WALLET_BALANCE'
    );
  }

  wallet.balance -= amount;
  wallet.transactions.push({
    type: 'debit',
    amount,
    source: 'order_payment',
    description,
    orderId,
    createdAt: new Date(),
  });
  await wallet.save();
  return wallet;
}

// ─── Refund Wallet ──────────────────────────────────────────────────────────────

export async function refundWallet(
  userId: string,
  amount: number,
  orderId: string,
  description: string
) {
  const wallet = await getOrCreate(userId);
  wallet.balance += amount;
  wallet.transactions.push({
    type: 'credit',
    amount,
    source: 'refund',
    description,
    orderId,
    createdAt: new Date(),
  });
  await wallet.save();
  return wallet;
}

// ─── Get transaction history ──────────────────────────────────────────────────

export async function getTransactions(userId: string, page = 1, limit = 20) {
  const wallet = await getOrCreate(userId);
  const all = wallet.transactions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const start = (page - 1) * limit;
  return {
    balance: wallet.balance,
    transactions: all.slice(start, start + limit),
    total: all.length,
    hasMore: start + limit < all.length,
  };
}
