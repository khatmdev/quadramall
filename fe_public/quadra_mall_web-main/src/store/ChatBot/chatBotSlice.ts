// store/Chat/chatSlice.ts - Fixed to use api instance consistently
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '@/main';
import { 
  ChatState, 
  ChatMessage, 
  ChatSession, 
  ChatRequest, 
  ChatResponse,
  ConversationHistoryResponse,
  SearchRequest,
  ProductSchema,
  MessageRole,
  MessageStatus,
  ConversationType
} from '@/types/ChatBot/interface';
import { v4 as uuidv4 } from 'uuid';

// Session management helpers (unchanged)
const getStoredSession = (): ChatSession | null => {
  try {
    const stored = localStorage.getItem('chatSession');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load stored session:', e);
    return null;
  }
};

const saveSession = (session: ChatSession) => {
  try {
    localStorage.setItem('chatSession', JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
};

const clearStoredSession = () => {
  try {
    localStorage.removeItem('chatSession');
  } catch (e) {
    console.warn('Failed to clear stored session:', e);
  }
};

// Initial state (unchanged)
const initialState: ChatState = {
  currentSession: getStoredSession(),
  messages: getStoredSession()?.messages || [],
  loading: false,
  streaming: false,
  error: null,
  conversations: [],
  conversationsLoading: false,
  searchResults: [],
  searchLoading: false,
  isConnected: true,
  reconnectAttempts: 0,
};

// ✅ FIX 1: sendMessage - Already using api instance correctly
export const sendMessage = createAsyncThunk<
  ChatResponse,
  { message: string; userId?: string },
  { rejectValue: string }
>('chat/sendMessage', async ({ message, userId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { chat: ChatState };
    const currentSession = state.chat.currentSession;
    
    const payload: ChatRequest = {
      message,
      user_id: userId,
      session_id: currentSession?.session_id,
      conversation_id: currentSession?.conversation_id,
      stream: false,
    };

    console.log('Sending message with payload:', payload);

    // ✅ Using api instance - token automatically added by interceptor
    const response = await api.post('/api/v1/chatbot/send', payload);
    
    console.log('Message response:', response.data);
    return response.data;
    
  } catch (err: unknown) {
    console.error('Send message error:', err);
    
    if (err instanceof AxiosError) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          `HTTP ${err.response?.status}: ${err.response?.statusText}` ||
                          'Failed to send message';
      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// ✅ FIX 2: sendStreamMessage - Use api instance for streaming too
export const sendStreamMessage = createAsyncThunk<
  void,
  { message: string; userId?: string; onChunk: (chunk: any) => void },
  { rejectValue: string }
>('chat/sendStreamMessage', async ({ message, userId, onChunk }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { chat: ChatState };
    const currentSession = state.chat.currentSession;
    
    const payload: ChatRequest = {
      message,
      user_id: userId,
      session_id: currentSession?.session_id,
      conversation_id: currentSession?.conversation_id,
      stream: true,
    };

    console.log('Starting stream with payload:', payload);

    // ✅ CRITICAL FIX: Use api instance for streaming
    // The axios instance already has authorization headers configured
    const response = await api.post('/api/v1/chatbot/send-stream', payload, {
      responseType: 'stream',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      // ✅ For streaming, we need to handle the response differently
      onDownloadProgress: (progressEvent) => {
        // This will be called for each chunk
        const chunk = progressEvent.event?.target?.response;
        if (chunk) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('Stream chunk received:', data);
                onChunk(data);
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      }
    });

    console.log('Stream response status:', response.status);

  } catch (err: unknown) {
    console.error('Stream error:', err);
    
    if (err instanceof AxiosError) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          `HTTP ${err.response?.status}: ${err.response?.statusText}` ||
                          'Stream request failed';
      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Stream error occurred');
  }
});

// ✅ FIX 3: Alternative streaming approach using fetch but with proper token
export const sendStreamMessageFetch = createAsyncThunk<
  void,
  { message: string; userId?: string; onChunk: (chunk: any) => void },
  { rejectValue: string }
>('chat/sendStreamMessageFetch', async ({ message, userId, onChunk }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { chat: ChatState };
    const currentSession = state.chat.currentSession;
    
    const payload: ChatRequest = {
      message,
      user_id: userId,
      session_id: currentSession?.session_id,
      conversation_id: currentSession?.conversation_id,
      stream: true,
    };

    console.log('Starting stream with payload:', payload);

    // ✅ Get token from the same place the api instance gets it
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    // ✅ Use the same baseURL as the api instance
    const baseURL = api.defaults.baseURL || 'http://localhost:8080';
    const response = await fetch(`${baseURL}/api/v1/chatbot/send-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(payload),
    });

    console.log('Stream response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stream error response:', errorText);
      throw new Error(`Stream request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Stream chunk received:', data);
              onChunk(data);
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (err: unknown) {
    console.error('Stream error:', err);
    
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Stream error occurred');
  }
});

// ✅ Other thunks already use api instance correctly
export const getConversationHistory = createAsyncThunk<
  ConversationHistoryResponse,
  { userId: string; limit?: number },
  { rejectValue: string }
>('chat/getConversationHistory', async ({ userId, limit = 10 }, { rejectWithValue }) => {
  try {
    // ✅ Already using api instance
    const response = await api.get(`/api/v1/chatbot/sessions?page=0&size=${limit}`);
    
    return {
      conversations: response.data || [],
      total: response.data?.length || 0
    };
  } catch (err: unknown) {
    console.error('Get conversation history error:', err);
    
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch conversations');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const searchProducts = createAsyncThunk<
  { products: ProductSchema[]; total_found: number },
  SearchRequest,
  { rejectValue: string }
>('chat/searchProducts', async (searchRequest, { rejectWithValue }) => {
  try {
    // ✅ Already using api instance
    const response = await api.post('/api/v1/search/products', searchRequest);
    return {
      products: response.data.products || [],
      total_found: response.data.total_found || 0,
    };
  } catch (err: unknown) {
    console.error('Search products error:', err);
    
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.error || 'Search failed');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const deleteConversation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('chat/deleteConversation', async (sessionId, { rejectWithValue }) => {
  try {
    // ✅ Already using api instance
    await api.delete(`/api/v1/chatbot/sessions/${sessionId}`);
    return sessionId;
  } catch (err: unknown) {
    console.error('Delete conversation error:', err);
    
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete conversation');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// ✅ Chat slice remains the same
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Session management
    createNewSession: (state, action: PayloadAction<{ userId?: string }>) => {
      const newSession: ChatSession = {
        session_id: uuidv4(),
        user_id: action.payload.userId,
        messages: [],
        conversation_type: ConversationType.GENERAL,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };
      
      state.currentSession = newSession;
      state.messages = [];
      saveSession(newSession);
      
      console.log('Created new session:', newSession.session_id);
    },

    loadSession: (state, action: PayloadAction<ChatSession>) => {
      state.currentSession = action.payload;
      state.messages = action.payload.messages;
      console.log('Loaded session:', action.payload.session_id);
    },

    clearSession: (state) => {
      const sessionId = state.currentSession?.session_id;
      state.currentSession = null;
      state.messages = [];
      clearStoredSession();
      console.log('Cleared session:', sessionId);
    },

    // Message management
    addUserMessage: (state, action: PayloadAction<{ content: string }>) => {
      const message: ChatMessage = {
        id: uuidv4(),
        role: MessageRole.USER,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        status: MessageStatus.SENDING,
      };

      state.messages.push(message);
      
      if (state.currentSession) {
        state.currentSession.messages.push(message);
        state.currentSession.updated_at = new Date().toISOString();
        saveSession(state.currentSession);
      }
      
      console.log('Added user message:', message.id);
    },

    addAssistantMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      
      if (state.currentSession) {
        state.currentSession.messages.push(action.payload);
        state.currentSession.updated_at = new Date().toISOString();
        saveSession(state.currentSession);
      }
      
      console.log('Added assistant message:', action.payload.id);
    },

    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<ChatMessage> }>) => {
      const { id, updates } = action.payload;
      
      const messageIndex = state.messages.findIndex((m: { id: string; }) => m.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
        console.log('Updated message:', id, updates);
      }

      if (state.currentSession) {
        const sessionMessageIndex = state.currentSession.messages.findIndex((m: { id: string; }) => m.id === id);
        if (sessionMessageIndex !== -1) {
          state.currentSession.messages[sessionMessageIndex] = {
            ...state.currentSession.messages[sessionMessageIndex],
            ...updates
          };
          saveSession(state.currentSession);
        }
      }
    },

    updateStreamingMessage: (state, action: PayloadAction<{ content: string; isComplete?: boolean }>) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === MessageRole.ASSISTANT) {
        lastMessage.content += action.payload.content;
        if (action.payload.isComplete) {
          lastMessage.status = MessageStatus.DELIVERED;
        }
        
        // Update session
        if (state.currentSession) {
          const lastSessionMessage = state.currentSession.messages[state.currentSession.messages.length - 1];
          if (lastSessionMessage && lastSessionMessage.role === MessageRole.ASSISTANT) {
            lastSessionMessage.content = lastMessage.content;
            lastSessionMessage.status = lastMessage.status;
            saveSession(state.currentSession);
          }
        }
      }
    },

    // UI state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.streaming = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.reconnectAttempts = 0;
      }
      console.log('Connection status:', action.payload);
    },

    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
      console.log('Reconnect attempts:', state.reconnectAttempts);
    },
  },

  extraReducers: (builder) => {
    builder
      // Send message (unchanged)
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Send message pending...');
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Send message fulfilled:', action.payload);
        
        // Update user message status
        const lastUserMessage = state.messages
          .filter((m: { role: any; }) => m.role === MessageRole.USER)
          .pop();
        if (lastUserMessage) {
          lastUserMessage.status = MessageStatus.DELIVERED;
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: action.payload.messageId || action.payload.message_id || uuidv4(),
          role: MessageRole.ASSISTANT,
          content: action.payload.message,
          timestamp: action.payload.timestamp || new Date().toISOString(),
          status: MessageStatus.DELIVERED,
          products: action.payload.products,
          total_found: action.payload.totalFound || action.payload.total_found,
          search_type: action.payload.searchType || action.payload.search_type,
          confidence: action.payload.confidence,
        };

        state.messages.push(assistantMessage);

        // Update session
        if (state.currentSession) {
          if (action.payload.conversationId || action.payload.conversation_id) {
            state.currentSession.conversation_id = action.payload.conversationId || action.payload.conversation_id;
          }
          
          if (action.payload.sessionId || action.payload.session_id) {
            state.currentSession.session_id = action.payload.sessionId || action.payload.session_id;
          }
          
          state.currentSession.conversation_type = action.payload.conversationType || action.payload.conversation_type || ConversationType.GENERAL;
          state.currentSession.messages = state.messages;
          state.currentSession.updated_at = new Date().toISOString();
          saveSession(state.currentSession);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Send message rejected:', action.payload);
        
        const lastUserMessage = state.messages
          .filter((m: { role: any; }) => m.role === MessageRole.USER)
          .pop();
        if (lastUserMessage) {
          lastUserMessage.status = MessageStatus.ERROR;
        }
      })

      // Stream message - Updated for new approaches
      .addCase(sendStreamMessage.pending, (state) => {
        state.streaming = true;
        state.error = null;
        console.log('Stream message pending...');
      })
      .addCase(sendStreamMessage.fulfilled, (state) => {
        state.streaming = false;
        console.log('Stream message fulfilled');
      })
      .addCase(sendStreamMessage.rejected, (state, action) => {
        state.streaming = false;
        state.error = action.payload as string;
        console.error('Stream message rejected:', action.payload);
      })

      // Alternative stream message
      .addCase(sendStreamMessageFetch.pending, (state) => {
        state.streaming = true;
        state.error = null;
        console.log('Stream message fetch pending...');
      })
      .addCase(sendStreamMessageFetch.fulfilled, (state) => {
        state.streaming = false;
        console.log('Stream message fetch fulfilled');
      })
      .addCase(sendStreamMessageFetch.rejected, (state, action) => {
        state.streaming = false;
        state.error = action.payload as string;
        console.error('Stream message fetch rejected:', action.payload);
      })

      // Rest of the reducers remain the same...
      .addCase(getConversationHistory.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(getConversationHistory.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.conversations;
        console.log('Loaded conversations:', action.payload.conversations.length);
      })
      .addCase(getConversationHistory.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload as string;
        console.error('Get conversation history rejected:', action.payload);
      })

      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        console.log('Search results:', action.payload.products.length);
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
        console.error('Search products rejected:', action.payload);
      })

      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          (conv: { conversation_id: string; }) => conv.conversation_id !== action.payload
        );
        console.log('Deleted conversation:', action.payload);
      });
  },
});

export const {
  createNewSession,
  loadSession,
  clearSession,
  addUserMessage,
  addAssistantMessage,
  updateMessage,
  updateStreamingMessage,
  setLoading,
  setStreaming,
  clearError,
  setConnectionStatus,
  incrementReconnectAttempts,
} = chatSlice.actions;

export default chatSlice.reducer;