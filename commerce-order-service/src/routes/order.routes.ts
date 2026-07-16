import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as controller from '../controllers/order.controller';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema, orderIdParamsSchema, getOrdersQuerySchema } from '../validators/order.validators';

const router = Router();
router.use(authMiddleware);

router.post('/', validate({ body: createOrderSchema }), controller.createOrder);
router.get('/', validate({ query: getOrdersQuerySchema }), controller.listOrders);
router.get('/:id', validate({ params: orderIdParamsSchema }), controller.getOrder);
router.get('/:id/tracking', validate({ params: orderIdParamsSchema }), controller.getTracking);
router.patch('/:id/cancel', validate({ params: orderIdParamsSchema }), controller.cancelOrder);
router.patch('/:id/advance', validate({ params: orderIdParamsSchema }), controller.advanceStatus);
router.post('/:id/reorder', validate({ params: orderIdParamsSchema }), controller.reorder);

export default router;
