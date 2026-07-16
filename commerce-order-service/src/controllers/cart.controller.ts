import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as cartService from '../services/cart.service';

export async function getCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.userId!);
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
}

export async function addItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, size, color, quantity } = req.body;
    const cart = await cartService.addItem(req.userId!, { productId, size, color, quantity: Number(quantity) || 1 });
    res.json({ success: true, message: 'Added to cart.', data: { cart } });
  } catch (err) { next(err); }
}

export async function syncCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items } = req.body;
    const cart = await cartService.syncCart(req.userId!, items ?? []);
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
}

export async function updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, size, color, quantity } = req.body;
    const cart = await cartService.updateItemQuantity(
      req.userId!, productId, size, color, Number(quantity)
    );
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
}

export async function removeItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, size, color } = req.body;
    const cart = await cartService.removeItem(req.userId!, productId, size, color);
    res.json({ success: true, message: 'Item removed.', data: { cart } });
  } catch (err) { next(err); }
}

export async function clearCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await cartService.clearCart(req.userId!);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { next(err); }
}
