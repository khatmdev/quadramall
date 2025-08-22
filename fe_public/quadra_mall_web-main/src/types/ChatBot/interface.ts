// types/Chat/base/Request/chatRequest.ts
export interface ChatRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  conversation_id?: string;
  stream?: boolean;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  min_score?: number;
}

// types/Chat/base/Response/chatResponse.ts
export interface ProductSchema {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  store?: string;
  minPrice?: number;
  maxPrice?: number;
  total_stock?: number;
  thumbnailUrl?: string;
  similarity_score?: number;
  rank?: number;
  url?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  message_id: string;
  products?: ProductSchema[];
  total_found: number;
  conversation_type: ConversationType;
  has_context: boolean;
  search_type?: SearchType;
  confidence?: number;
}

export interface ConversationHistoryResponse {
  conversations: ConversationSchema[];
  total: number;
}

export interface ConversationSchema {
  conversation_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  conversation_type: ConversationType;
  last_message_preview?: string;
  current_topic?: string;
}

// types/Chat/enums.ts
export enum MessageRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT", 
  SYSTEM = "SYSTEM"
}

export enum ConversationType {
  PRODUCT_SEARCH = "PRODUCT_SEARCH",
  POLICY_SUPPORT = "POLICY_SUPPORT", 
  USER_SUPPORT = "USER_SUPPORT",
  GENERAL = "GENERAL"
}

export enum SearchType {
  VECTOR_SEARCH = "VECTOR_SEARCH",
  POLICY_SUPPORT = "POLICY_SUPPORT",
  USER_SUPPORT = "USER_SUPPORT", 
  AI_FALLBACK = "AI_FALLBACK",
  HYBRID = "HYBRID"
}

export enum MessageStatus {
  SENDING = "SENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  ERROR = "ERROR"
}

// types/Chat/states/ChatState.ts
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status: MessageStatus;
  products?: ProductSchema[];
  metadata?: Record<string, any>;
  total_found?: number;
  search_type?: SearchType;
  confidence?: number;
}

export interface ChatSession {
  session_id: string;
  conversation_id?: string;
  user_id?: string;
  messages: ChatMessage[];
  conversation_type: ConversationType;
  current_topic?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatState {
  // Current session
  currentSession: ChatSession | null;
  
  // Messages
  messages: ChatMessage[];
  
  // UI States
  loading: boolean;
  streaming: boolean;
  error: string | null;
  
  // Conversations
  conversations: ConversationSchema[];
  conversationsLoading: boolean;
  
  // Search
  searchResults: ProductSchema[];
  searchLoading: boolean;
  
  // Session management
  isConnected: boolean;
  reconnectAttempts: number;
}