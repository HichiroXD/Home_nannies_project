// frontend_nannies/src/api/chatApi.js
import API from './api';

/**
 * API de Chat - Sistema de mensajería
 */

export const chatApi = {
  /**
   * Obtiene todas las conversaciones del usuario
   */
  getConversations: async () => {
    const response = await API.get('/chat/conversations/');
    return response.data;
  },

  /**
   * Obtiene mensajes de una conversación específica
   */
  getMessages: async (conversationId) => {
    const response = await API.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  },

  /**
   * Envía un mensaje a otro usuario
   */
  sendMessage: async (receiverId, content) => {
    const response = await API.post('/chat/send/', {
      receiver_id: receiverId,
      content
    });
    return response.data;
  },

  /**
   * Obtiene el conteo de mensajes no leídos
   */
  getUnreadCount: async () => {
    const response = await API.get('/chat/unread-count/');
    return response.data;
  }
};

export default chatApi;
