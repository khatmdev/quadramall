import { type AxiosInstance } from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, Conversation, Notification, ChatMessagePayload } from '@/types/chat';

export class ChatService {
  private stompClient: Client | null = null;
  private connected: boolean = false;
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onNotificationReceived: ((notification: Notification) => void) | null = null;
  private readonly api: AxiosInstance;
  // Manage conversation topic subscriptions
  private conversationSubscriptions: Record<number, ReturnType<Client['subscribe']> | null> = {};

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  // Kết nối WebSocket
  connect(userId: number, onConnectCallback: () => void, onErrorCallback: (error: unknown) => void): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP Debug:', str),
    });

    this.stompClient.onConnect = () => {
      this.connected = true;
      console.log(`WebSocket connected for user ${userId}`);

      // Subscribe tin nhắn cá nhân
      this.stompClient!.subscribe(`/user/${userId}/queue/messages`, (message) => {
        if (this.onMessageReceived) {
          this.onMessageReceived(JSON.parse(message.body) as ChatMessage);
        }
      });

      // Subscribe thông báo
      this.stompClient!.subscribe(`/topic/notifications/${userId}`, (notification) => {
        if (this.onNotificationReceived) {
          this.onNotificationReceived(JSON.parse(notification.body) as Notification);
        }
      });

      onConnectCallback();
    };

    this.stompClient.onStompError = (frame) => {
      this.connected = false;
      console.error('STOMP Error:', frame.headers.message);
      onErrorCallback(frame.headers.message);
    };

    this.stompClient.onWebSocketError = (error) => {
      this.connected = false;
      console.error('WebSocket Error:', error);
      onErrorCallback(error);
    };

    this.stompClient.onDisconnect = () => {
      this.connected = false;
      console.log('WebSocket Disconnected');
    };

    this.stompClient.activate();
  }

  // Ngắt kết nối WebSocket
  disconnect(): void {
    if (this.stompClient) {
      // Unsubscribe all conversation topic subscriptions
      Object.keys(this.conversationSubscriptions).forEach((key) => {
        const sub = this.conversationSubscriptions[Number(key)];
        if (sub && typeof sub.unsubscribe === 'function') {
          try {
            sub.unsubscribe();
          } catch {
            // ignore unsubscribe errors
          }
        }
      });
      this.conversationSubscriptions = {};

      this.stompClient.deactivate();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  // Gửi tin nhắn qua WebSocket
  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  // Gửi tin nhắn qua REST API để lưu vào backend
  async sendMessageRest(payload: ChatMessagePayload): Promise<ChatMessage> {
    const response = await this.api.post('/api/chat/send-message', payload);
    return response.data as ChatMessage;
  }

  // Đặt callback nhận tin nhắn
  setOnMessageReceived(callback: (message: ChatMessage) => void): void {
    this.onMessageReceived = callback;
  }

  // Đặt callback nhận thông báo
  setOnNotificationReceived(callback: (notification: Notification) => void): void {
    this.onNotificationReceived = callback;
  }

  // Subscribe vào /topic/conversations/{conversationId} để nhận tin nhắn realtime cho cuộc trò chuyện
  subscribeConversation(conversationId: number, callback: (message: ChatMessage) => void): void {
    if (!this.stompClient || !this.connected) return;
    if (this.conversationSubscriptions[conversationId]) return; // already subscribed

    const sub = this.stompClient.subscribe(`/topic/conversations/${conversationId}`, (msg) => {
      try {
        const payload = JSON.parse(msg.body) as ChatMessage;
        callback(payload);
      } catch (e) {
        console.error('Failed to parse conversation message', e);
      }
    });

    this.conversationSubscriptions[conversationId] = sub;
  }

  // Unsubscribe khỏi topic cuộc trò chuyện
  unsubscribeConversation(conversationId: number): void {
    const sub = this.conversationSubscriptions[conversationId];
    if (sub && typeof sub.unsubscribe === 'function') {
      try {
        sub.unsubscribe();
      } catch {
        // ignore
      }
    }
    delete this.conversationSubscriptions[conversationId];
  }

  // Lấy danh sách tin nhắn qua REST API
  async getMessages(conversationId: number): Promise<ChatMessage[]> {
    const response = await this.api.get(`/api/chat/conversations/${conversationId}/messages`);
    return response.data as ChatMessage[];
  }

  // Lấy danh sách thông báo chưa đọc qua REST API
  async getNotifications(userId: number): Promise<Notification[]> {
    const response = await this.api.get('/api/chat/notifications', {
      params: { userId }
    });
    return response.data as Notification[];
  }

  // Đánh dấu thông báo đã đọc
  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.api.put(`/api/chat/notifications/${notificationId}/read`);
  }

  // Lấy hoặc tạo cuộc trò chuyện qua REST API
  async getOrCreateConversation(customerId: number, storeId: number): Promise<Conversation> {
    const response = await this.api.get('/api/chat/conversations', {
      params: { customerId, storeId }
    });
    return response.data as Conversation;
  }

  // Lấy danh sách cuộc trò chuyện của user
  async getUserConversations(customerId: number): Promise<Conversation[]> {
    try {
      const response = await this.api.get(`/api/chat/user-conversations/${customerId}`);
      return response.data as Conversation[];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  }

  // Lấy thông tin store
  async getStoreInfo(storeId: number): Promise<{ id: number; name: string; logo?: string }> {
    const response = await this.api.get(`/api/stores/${storeId}`);
    return response.data;
  }
}

export default ChatService;
