import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as wishlistService from '../services/wishlist.service';

export async function getWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const products = await wishlistService.getWishlist(req.userId!);
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
}

export async function addToWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await wishlistService.addToWishlist(req.userId!, String(req.params.productId));
    res.status(201).json({ success: true, message: 'Added to wishlist.', data: { product } });
  } catch (err) { next(err); }
}

export async function removeFromWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await wishlistService.removeFromWishlist(req.userId!, String(req.params.productId));
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) { next(err); }
}
