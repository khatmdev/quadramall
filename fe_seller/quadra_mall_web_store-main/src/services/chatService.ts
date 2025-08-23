import { api } from '@/main';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


// DTO types (should match backend)
export interface ChatMessageDTO {
  id?: number;
  senderId: number;
  receiverId: number;
  messageText: string; // Đã thay đổi từ 'content' thành 'messageText'
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  conversationId?: number;
}

export interface ConversationDTO {
  id: number;
  customerId: number;
  storeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationDTO {
  id?: number;
  userId?: number;
  storeId?: number;
  content: string;
  type: string;
  createdAt?: string;
  read: boolean;
}

// Thay đổi base URL để trỏ trực tiếp tới backend
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/chat`;

// TODO: Cài đặt package trước khi sử dụng WebSocket:
// npm install @stomp/stompjs sockjs-client
// npm install --save-dev @types/sockjs-client


// WebSocket STOMP client
let stompClient: Client | null = null;
let connected = false;
let onMessageReceived: ((message: ChatMessageDTO) => void) | null = null;
let onNotificationReceived: ((notification: NotificationDTO) => void) | null = null;

// Conversation topic subscriptions
const conversationSubscriptions: Map<number, StompSubscription> = new Map();
const conversationCallbacks: Map<number, Array<(message: ChatMessageDTO) => void>> = new Map();

// Kết nối WebSocket
export const connectWebSocket = (
  userId: number,
  onConnectCallback: () => void,
  onErrorCallback: (error: unknown) => void
) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_WS_URL}`,),
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str: string) => console.log('STOMP Debug:', str),
  });

  stompClient.onConnect = () => {
    connected = true;
    console.log('WebSocket connected, subscribing to channels...');
    
    // Subscribe tin nhắn cá nhân
    stompClient!.subscribe(`/user/${userId}/queue/messages`, (message: unknown) => {
      if (onMessageReceived && message && typeof message === 'object' && 'body' in message) {
        try {
          const parsedMessage = JSON.parse((message as { body: string }).body) as ChatMessageDTO;
          console.log('[WS] Received user queue message:', parsedMessage);
          onMessageReceived(parsedMessage);
        } catch (e) {
          console.error('Failed to parse user queue message:', e);
        }
      }
    });
    
    // Subscribe thông báo
    stompClient!.subscribe(`/topic/notifications/${userId}`, (notification: unknown) => {
      if (onNotificationReceived && notification && typeof notification === 'object' && 'body' in notification) {
        try {
          const parsedNotification = JSON.parse((notification as { body: string }).body) as NotificationDTO;
          console.log('[WS] Received notification:', parsedNotification);
          onNotificationReceived(parsedNotification);
        } catch (e) {
          console.error('Failed to parse notification:', e);
        }
      }
    });

    // Re-subscribe to conversation topics after reconnect
    conversationCallbacks.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        subscribeToConversationTopic(conversationId);
      }
    });
    
    onConnectCallback();
  };

  stompClient.onStompError = (frame: unknown) => {
    connected = false;
    if (frame && typeof frame === 'object' && 'headers' in frame && frame.headers && typeof frame.headers === 'object' && 'message' in frame.headers) {
      onErrorCallback((frame.headers as { message: string }).message);
    } else {
      onErrorCallback('STOMP Error');
    }
  };

  stompClient.onWebSocketError = (error: unknown) => {
    connected = false;
    onErrorCallback(error);
  };

  stompClient.onDisconnect = () => {
    connected = false;
  };

  stompClient.activate();
};

// Ngắt kết nối WebSocket
export const disconnectWebSocket = () => {
  if (stompClient) {
    // Cleanup conversation subscriptions
    conversationSubscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        console.error('Error unsubscribing from conversation topic:', e);
      }
    });
    conversationSubscriptions.clear();
    conversationCallbacks.clear();
    
    stompClient.deactivate();
    connected = false;
  }
};

// Internal function to subscribe to conversation topic
const subscribeToConversationTopic = (conversationId: number) => {
  if (!stompClient || !connected) {
    console.log(`Cannot subscribe to conversation ${conversationId}: WebSocket not connected`);
    return;
  }

  // Avoid duplicate subscriptions
  if (conversationSubscriptions.has(conversationId)) {
    return;
  }

  console.log(`Subscribing to conversation topic: /topic/conversations/${conversationId}`);
  
  const subscription = stompClient.subscribe(`/topic/conversations/${conversationId}`, (message: unknown) => {
    if (message && typeof message === 'object' && 'body' in message) {
      try {
        const parsedMessage = JSON.parse((message as { body: string }).body) as ChatMessageDTO;
        console.log(`[WS] Received conversation ${conversationId} message:`, parsedMessage);
        
        // Call all registered callbacks for this conversation
        const callbacks = conversationCallbacks.get(conversationId) || [];
        callbacks.forEach(callback => {
          try {
            callback(parsedMessage);
          } catch (e) {
            console.error('Error in conversation callback:', e);
          }
        });
      } catch (e) {
        console.error('Failed to parse conversation message:', e);
      }
    }
  });

  conversationSubscriptions.set(conversationId, subscription);
};

// Subscribe to a specific conversation topic
export const subscribeToConversation = (
  conversationId: number,
  callback: (message: ChatMessageDTO) => void
): (() => void) => {
  // Add callback to the list
  const callbacks = conversationCallbacks.get(conversationId) || [];
  callbacks.push(callback);
  conversationCallbacks.set(conversationId, callbacks);

  // Subscribe to the topic if connected
  if (connected) {
    subscribeToConversationTopic(conversationId);
  }

  // Return unsubscribe function
  return () => {
    const currentCallbacks = conversationCallbacks.get(conversationId) || [];
    const filteredCallbacks = currentCallbacks.filter(cb => cb !== callback);
    
    if (filteredCallbacks.length === 0) {
      // No more callbacks, unsubscribe from topic
      const subscription = conversationSubscriptions.get(conversationId);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.error('Error unsubscribing from conversation:', e);
        }
        conversationSubscriptions.delete(conversationId);
      }
      conversationCallbacks.delete(conversationId);
    } else {
      conversationCallbacks.set(conversationId, filteredCallbacks);
    }
  };
};

// Gửi tin nhắn qua WebSocket
export const sendMessageWebSocket = (message: ChatMessageDTO) => {
  if (stompClient && connected) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
    });
  } else {
    console.error('WebSocket not connected');
  }
};

// Đặt callback nhận tin nhắn
export const setOnMessageReceived = (callback: (message: ChatMessageDTO) => void) => {
  onMessageReceived = callback;
};

// Đặt callback nhận thông báo
export const setOnNotificationReceived = (callback: (notification: NotificationDTO) => void) => {
  onNotificationReceived = callback;
};


export const getMessagesByConversation = (conversationId: number) =>
  api.get<ChatMessageDTO[]>(`${API_BASE_URL}/conversations/${conversationId}/messages`);

export const getUnreadNotifications = (userId?: number, storeId?: number) =>
  api.get<NotificationDTO[]>(`${API_BASE_URL}/notifications`, { params: { userId, storeId } });

export const getOrCreateConversation = (customerId: number, storeId: number) =>
  api.get<ConversationDTO>(`${API_BASE_URL}/conversations`, { params: { customerId, storeId } });

export const getUserConversations = (customerId: number) =>
  api.get<ConversationDTO[]>(`${API_BASE_URL}/user-conversations/${customerId}`);

export const markNotificationAsRead = (notificationId: number) =>
  api.put(`${API_BASE_URL}/notifications/${notificationId}/read`);

export const sendMessageRest = (chatMessageDTO: ChatMessageDTO) =>
  api.post<ChatMessageDTO>(`${API_BASE_URL}/send-message`, chatMessageDTO);

export const getStoreConversations = (storeId: number) =>
  api.get<ConversationDTO[]>(`${API_BASE_URL}/store-conversations/${storeId}`);

export const markAllNotificationsAsRead = (userId?: number, storeId?: number) =>
  api.put(`${API_BASE_URL}/notifications/mark-all-read`, null, { params: { userId, storeId } });

export const deleteConversation = (conversationId: number) =>
  api.delete(`${API_BASE_URL}/conversations/${conversationId}`);

export const getUnreadNotificationCount = (userId?: number, storeId?: number) =>
  api.get<number>(`${API_BASE_URL}/notifications/unread-count`, { params: { userId, storeId } });