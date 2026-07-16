import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as controller from '../controllers/wallet.controller';
import { validate } from '../middlewares/validate.middleware';
import { addFundsSchema, walletQuerySchema } from '../validators/wallet.validators';

const router = Router();
router.use(authMiddleware);

router.get('/', controller.getWallet);
router.post('/topup', validate({ body: addFundsSchema }), controller.topUp);
router.get('/transactions', validate({ query: walletQuerySchema }), controller.getTransactions);

export default router;
