import { Router } from 'express';
import * as controller from '../controllers/wishlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { wishlistParamsSchema } from '../validators/wishlist.validators';

const router = Router();

// All wishlist routes require auth
router.use(authMiddleware);

router.get('/', controller.getWishlist);
router.post('/:productId', validate({ params: wishlistParamsSchema }), controller.addToWishlist);
router.delete('/:productId', validate({ params: wishlistParamsSchema }), controller.removeFromWishlist);

export default router;
