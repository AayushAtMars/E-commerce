import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as controller from '../controllers/cart.controller';
import { validate } from '../middlewares/validate.middleware';
import { addItemSchema, updateQuantitySchema, removeItemSchema, syncCartSchema } from '../validators/cart.validators';

const router = Router();
router.use(authMiddleware);

router.get('/', controller.getCart);
router.post('/add', validate({ body: addItemSchema }), controller.addItem);
router.post('/sync', validate({ body: syncCartSchema }), controller.syncCart);
router.patch('/quantity', validate({ body: updateQuantitySchema }), controller.updateQuantity);
router.delete('/item', validate({ body: removeItemSchema }), controller.removeItem);
router.delete('/', controller.clearCart);

export default router;
