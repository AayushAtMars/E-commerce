import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as reviewService from '../services/review.service';

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const result = await reviewService.getProductReviews(String(req.params.productId), page, limit);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.createReview({
      productId: String(req.params.productId),
      userId: req.userId!,
      userName: req.body.userName,
      userAvatar: req.body.userAvatar,
      rating: req.body.rating,
      text: req.body.text,
      photos: req.body.photos,
    });
    res.status(201).json({ success: true, message: 'Review posted.', data: { review } });
  } catch (err) { next(err); }
}
