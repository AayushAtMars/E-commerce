import { Router } from 'express';
import * as controller from '../controllers/address.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { addressIdParamsSchema, createAddressSchema, updateAddressSchema } from '../validators/address.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', controller.getAddresses);
router.post('/', validate({ body: createAddressSchema }), controller.createAddress);
router.put('/:id', validate({ params: addressIdParamsSchema, body: updateAddressSchema }), controller.updateAddress);
router.delete('/:id', validate({ params: addressIdParamsSchema }), controller.deleteAddress);
router.patch('/:id/default', validate({ params: addressIdParamsSchema }), controller.setDefault);

export default router;
