import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as walletService from '../services/wallet.service';

export async function getWallet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wallet = await walletService.getWallet(req.userId!);
    res.json({ success: true, data: { wallet } });
  } catch (err) { next(err); }
}

export async function topUp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount } = req.body;
    const wallet = await walletService.topUp(req.userId!, Number(amount));
    res.json({ success: true, message: `₹${amount} added to wallet.`, data: { wallet } });
  } catch (err) { next(err); }
}

export async function getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await walletService.getTransactions(req.userId!, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
