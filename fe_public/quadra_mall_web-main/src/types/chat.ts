export interface ChatMessage {
  // updated to make id optional and conversationId required
  id?: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  isRead?: boolean | number; // Handle BIT(1) from DB: 0=unread, 1=read
}

// New payload type used when creating/sending a message via REST - exclude isRead
export type ChatMessagePayload = Omit<ChatMessage, 'id' | 'createdAt' | 'isRead'>;

export interface Conversation {
  id: number;
  customerId: number;
  storeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: number;
  userId?: number | null;
  storeId?: number | null;
  content: string;
  type: string;
  createdAt?: string;
  isRead: boolean; // Backend uses Boolean, not bit(1)
}
