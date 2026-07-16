import { Router } from 'express';
import * as controller from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { addReviewSchema, reviewParamsSchema } from '../validators/review.validators';
import { paginationQuerySchema } from '../validators/product.validators';

const router = Router({ mergeParams: true }); // Get :productId from parent router

// Public
router.get('/', validate({ params: reviewParamsSchema, query: paginationQuerySchema }), controller.getReviews);

// Protected
router.post('/', authMiddleware, validate({ params: reviewParamsSchema, body: addReviewSchema }), controller.createReview);

export default router;
