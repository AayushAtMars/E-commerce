import mongoose from 'mongoose';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { DeliveryPartner } from '../models/DeliveryPartner';
import { createError } from '../middlewares/error.middleware';

export async function getActiveChats(userId: string) {
  const chats = await Chat.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate('partnerId', 'name avatar online') // We'll mock online status for now
    .sort({ lastMessageTime: -1 });

  return chats.map(chat => {
    const partner: any = chat.partnerId;
    return {
      id: chat._id,
      partner: {
        id: partner._id,
        name: partner.name,
        avatar: partner.avatar,
        online: true, // Mock online
      },
      lastMessage: chat.lastMessage,
      time: chat.lastMessageTime,
      unread: chat.unreadCount,
    };
  });
}

export async function startChat(userId: string, partnerData: any) {
  let pId: mongoose.Types.ObjectId;

  // Handle case where frontend might send the whole agent object without _id due to cache
  if (typeof partnerData === 'string' && mongoose.Types.ObjectId.isValid(partnerData)) {
    pId = new mongoose.Types.ObjectId(partnerData);
  } else if (partnerData._id && mongoose.Types.ObjectId.isValid(partnerData._id)) {
    pId = new mongoose.Types.ObjectId(partnerData._id);
  } else if (partnerData.name) {
    const found = await DeliveryPartner.findOne({ name: partnerData.name });
    if (!found) throw createError('Delivery partner not found by name', 404);
    pId = found._id as mongoose.Types.ObjectId;
  } else {
    throw createError('Invalid partner data', 400);
  }

  const uId = new mongoose.Types.ObjectId(userId);

  let chat = await Chat.findOne({ userId: uId, partnerId: pId });
  if (!chat) {
    const partner = await DeliveryPartner.findById(pId);
    if (!partner) throw createError('Delivery partner not found', 404);

    chat = await Chat.create({
      userId: uId,
      partnerId: pId,
      lastMessage: '',
      lastMessageTime: new Date(),
    });
  }
  return { chatId: chat._id };
}

export async function getChatMessages(userId: string, chatId: string) {
  const chat = await Chat.findOne({ _id: chatId, userId: new mongoose.Types.ObjectId(userId) });
  if (!chat) throw createError('Chat not found', 404);

  // Clear unread count when user views messages
  chat.unreadCount = 0;
  await chat.save();

  const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
  
  return messages.map(msg => ({
    id: msg._id,
    senderId: msg.senderType === 'user' ? 'me' : msg.senderId.toString(),
    type: msg.type,
    text: msg.text,
    imageUrl: msg.imageUrl,
    duration: msg.duration,
    time: msg.createdAt,
  }));
}

export async function sendMessage(userId: string, chatId: string, text: string) {
  const chat = await Chat.findOne({ _id: chatId, userId: new mongoose.Types.ObjectId(userId) });
  if (!chat) throw createError('Chat not found', 404);

  const userMsg = await Message.create({
    chatId: chat._id,
    senderId: chat.userId,
    senderType: 'user',
    type: 'text',
    text,
  });

  chat.lastMessage = text;
  chat.lastMessageTime = userMsg.createdAt;
  await chat.save();

  // Fire-and-forget: Auto-reply after a short delay
  setTimeout(() => {
    generateAutoReply(chat._id, chat.partnerId, text).catch(console.error);
  }, 1500);

  return {
    id: userMsg._id,
    senderId: 'me',
    type: 'text',
    text: userMsg.text,
    time: userMsg.createdAt,
  };
}

async function generateAutoReply(chatId: mongoose.Types.ObjectId, partnerId: mongoose.Types.ObjectId, userText: string) {
  const lowerText = userText.toLowerCase();
  let replyText = 'I am on my way, please wait a little longer.';

  if (lowerText.includes('where') || lowerText.includes('location')) {
    replyText = 'I am about 5-10 minutes away from your location.';
  } else if (lowerText.includes('number') || lowerText.includes('call')) {
    replyText = 'I will call you as soon as I reach.';
  } else if (lowerText.includes('fast') || lowerText.includes('quick')) {
    replyText = 'I am driving as fast as I safely can!';
  } else if (lowerText.includes('ok') || lowerText.includes('thanks') || lowerText.includes('thank')) {
    replyText = 'You are welcome!';
  }

  const partnerMsg = await Message.create({
    chatId,
    senderId: partnerId,
    senderType: 'partner',
    type: 'text',
    text: replyText,
  });

  // Update chat last message
  await Chat.updateOne(
    { _id: chatId },
    { 
      lastMessage: replyText, 
      lastMessageTime: partnerMsg.createdAt,
      $inc: { unreadCount: 1 } 
    }
  );
}
