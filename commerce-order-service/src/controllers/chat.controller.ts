import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as chatService from '../services/chat.service';

export async function getActiveChats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const chats = await chatService.getActiveChats(req.userId!);
    res.json({ success: true, data: { chats } });
  } catch (err) { next(err); }
}

export async function startChat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const partnerData = req.body.partnerId || req.body.partner;
    const result = await chatService.startChat(req.userId!, partnerData);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getChatMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const chatId = req.params.chatId as string;
    const messages = await chatService.getChatMessages(req.userId!, chatId);
    res.json({ success: true, data: { messages } });
  } catch (err) { next(err); }
}

export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const chatId = req.params.chatId as string;
    const { text } = req.body;
    const message = await chatService.sendMessage(req.userId!, chatId, text);
    res.json({ success: true, data: { message } });
  } catch (err) { next(err); }
}
