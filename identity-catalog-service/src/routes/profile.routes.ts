import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, updatePasswordSchema, deleteAccountSchema, updateNotificationPrefsSchema } from '../validators/profile.validators';
import * as controller from '../controllers/profile.controller';

const router = Router();
router.use(authMiddleware);

router.patch('/', validate({ body: updateProfileSchema }), controller.updateProfile);
router.patch('/password', validate({ body: updatePasswordSchema }), controller.changePassword);
router.delete('/', validate({ body: deleteAccountSchema }), controller.deleteAccount);
router.patch('/notifications', validate({ body: updateNotificationPrefsSchema }), controller.updateNotificationPrefs);

export default router;
