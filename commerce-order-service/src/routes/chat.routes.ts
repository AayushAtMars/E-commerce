import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { startChatSchema, chatIdParamsSchema, sendMessageSchema } from '../validators/chat.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', chatController.getActiveChats);
router.post('/start', validate({ body: startChatSchema }), chatController.startChat);
router.get('/:chatId/messages', validate({ params: chatIdParamsSchema }), chatController.getChatMessages);
router.post('/:chatId/messages', validate({ params: chatIdParamsSchema, body: sendMessageSchema }), chatController.sendMessage);

export default router;
