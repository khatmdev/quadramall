// hooks/useChat.ts
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { AppDispatch, RootState, useAppDispatch } from '@/store/index';
import {
  sendMessage,
  sendStreamMessage,
  createNewSession,
  clearSession,
  addUserMessage,
  getConversationHistory,
  searchProducts,
  clearError,
  setConnectionStatus,
} from '@/store/ChatBot/chatBotSlice';
import type { ChatMessage, SearchRequest } from '@/types/ChatBot/interface';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    currentSession,
    messages,
    loading,
    streaming,
    error,
    conversations,
    conversationsLoading,
    searchResults,
    searchLoading,
    isConnected,
  } = useSelector((state: RootState) => state.chat);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Send a message
  const sendChatMessage = useCallback(async (message: string, useStreaming = false) => {
    if (!message.trim()) return;

    const userId = user?.userId?.toString();

    if (useStreaming) {
      dispatch(addUserMessage({ content: message }));
      
      return dispatch(sendStreamMessage({
        message,
        userId,
        onChunk: (chunk: any) => {
          // Handle streaming chunks
          console.log('Streaming chunk:', chunk);
        },
      }));
    } else {
      dispatch(addUserMessage({ content: message }));
      return dispatch(sendMessage({ message, userId }));
    }
  }, [dispatch, user?.userId]);

  // Create new conversation
  const startNewConversation = useCallback(() => {
    const userId = user?.userId?.toString();
    dispatch(createNewSession({ userId }));
  }, [dispatch, user?.userId]);

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    dispatch(clearSession());
  }, [dispatch]);

  // Load conversation history
  const loadConversationHistory = useCallback((limit = 20) => {
    if (user?.userId) {
      dispatch(getConversationHistory({ 
        userId: user.userId.toString(), 
        limit 
      }));
    }
  }, [dispatch, user?.userId]);

  // Search products
  const searchForProducts = useCallback((searchRequest: SearchRequest) => {
    return dispatch(searchProducts(searchRequest));
  }, [dispatch]);

  // Clear error
  const clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Connection management
  const updateConnectionStatus = useCallback((connected: boolean) => {
    dispatch(setConnectionStatus(connected));
  }, [dispatch]);

  // Auto-initialize session for authenticated users
  useEffect(() => {
    if (isAuthenticated && !currentSession && user?.userId) {
      startNewConversation();
    }
  }, [isAuthenticated, currentSession, user?.userId, startNewConversation]);

  return {
    // State
    currentSession,
    messages,
    loading,
    streaming,
    error,
    conversations,
    conversationsLoading,
    searchResults,
    searchLoading,
    isConnected,
    isAuthenticated,
    user,

    // Actions
    sendChatMessage,
    startNewConversation,
    clearCurrentSession,
    loadConversationHistory,
    searchForProducts,
    clearChatError,
    updateConnectionStatus,
  };
};

// Hook for message utilities
export const useMessageUtils = () => {
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }, []);

  const getMessageStatusText = useCallback((status: string) => {
    switch (status) {
      case 'SENDING':
        return 'Đang gửi...';
      case 'SENT':
        return 'Đã gửi';
      case 'DELIVERED':
        return 'Đã giao';
      case 'ERROR':
        return 'Lỗi';
      default:
        return '';
    }
  }, []);

  const getConversationTypeText = useCallback((type: string) => {
    switch (type) {
      case 'PRODUCT_SEARCH':
        return 'Tìm sản phẩm';
      case 'POLICY_SUPPORT':
        return 'Hỗ trợ chính sách';
      case 'USER_SUPPORT':
        return 'Hỗ trợ khách hàng';
      case 'GENERAL':
        return 'Trò chuyện chung';
      default:
        return 'Không xác định';
    }
  }, []);

  return {
    formatTimestamp,
    getMessageStatusText,
    getConversationTypeText,
  };
};

// Hook for product utilities
export const useProductUtils = () => {
  const formatPrice = useCallback((price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const formatPriceRange = useCallback((minPrice?: number, maxPrice?: number) => {
    if (!minPrice && !maxPrice) return 'Liên hệ';
    if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice);
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }, [formatPrice]);

  const getStockStatusText = useCallback((stock?: number) => {
    if (!stock || stock === 0) return 'Hết hàng';
    if (stock < 10) return `Còn ${stock} sản phẩm`;
    return 'Còn hàng';
  }, []);

  const getStockStatusColor = useCallback((stock?: number) => {
    if (!stock || stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  }, []);

  return {
    formatPrice,
    formatPriceRange,
    getStockStatusText,
    getStockStatusColor,
  };
};