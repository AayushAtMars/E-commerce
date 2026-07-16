import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { validateCouponSchema } from '../validators/coupon.validators';
import * as controller from '../controllers/coupon.controller';

const router = Router();

router.get('/', controller.listCoupons);
router.post('/validate', authMiddleware, validate({ body: validateCouponSchema }), controller.validateCoupon);
router.post('/seed', controller.seedCoupons);

export default router;
