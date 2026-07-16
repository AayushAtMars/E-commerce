import { commerceApi } from './client';

export const chatApiModule = {
  // Get all active chats for the current user
  getActiveChats: () => {
    return commerceApi.get('/api/chat');
  },

  // Start or retrieve a chat session with a delivery partner
  startChat: (partner: any) => {
    return commerceApi.post('/api/chat/start', { partner });
  },

  // Get messages for a specific chat
  getChatMessages: (chatId: string) => {
    return commerceApi.get(`/api/chat/${chatId}/messages`);
  },

  // Send a message
  sendMessage: (chatId: string, text: string) => {
    return commerceApi.post(`/api/chat/${chatId}/messages`, { text });
  },
};
