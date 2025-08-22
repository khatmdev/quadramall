// components/Chat/ChatComponent.tsx
import  { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  sendMessage,
  sendStreamMessage,
  createNewSession,
  clearSession,
  addUserMessage,
  addAssistantMessage,
  updateStreamingMessage,
  setStreaming,
  clearError,
  getConversationHistory,
  deleteConversation,
  updateMessage,
} from '@/store/ChatBot/chatBotSlice';
import {
  MessageRole,
  MessageStatus,
  ConversationType,
  type ChatMessage,
  type ProductSchema,
} from '@/types/ChatBot/interface';
import { 
  Send, 
  Bot, 
  User, 
  ShoppingCart, 
  Trash2, 
  MessageSquare, 
  Loader2,
  Star,
  ExternalLink,
  Package,
  DollarSign,
  Truck,
  Shield,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ChatComponentProps {
  className?: string;
  enableStreaming?: boolean;
  showProductCards?: boolean;
  showConversationHistory?: boolean;
  onMessagesChange?: (hasMessages: boolean) => void;
}

export interface ChatComponentRef {
  sendQuickMessage: (message: string) => void;
}

const ChatComponent = forwardRef<ChatComponentRef, ChatComponentProps>(({
  className = '',
  enableStreaming = true,
  showProductCards = true,
  showConversationHistory = true,
  onMessagesChange,
}, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentSession,
    messages,
    loading,
    streaming,
    error,
    conversations,
    conversationsLoading,
  } = useSelector((state: RootState) => state.chat);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [inputMessage, setInputMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`; // Giới hạn chiều cao tối đa
    }
  }, [inputMessage]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || loading || streaming) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    // Add user message to state
    dispatch(addUserMessage({ content: messageContent }));

    try {
      if (enableStreaming) {
        // Handle streaming response
        dispatch(setStreaming(true));
        
        // Add placeholder assistant message for streaming
        const assistantMessageId = uuidv4();
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: MessageRole.ASSISTANT,
          content: '',
          timestamp: new Date().toISOString(),
          status: MessageStatus.SENDING,
        };
        dispatch(addAssistantMessage(assistantMessage));

        // Send streaming message
        await dispatch(sendStreamMessage({
          message: messageContent,
          userId: user?.userId?.toString(),
          onChunk: (chunk: any) => {
            switch (chunk.type) {
              case 'content':
                dispatch(updateStreamingMessage({ content: chunk.content }));
                break;
              case 'products':
                // Handle products data
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.id === assistantMessageId) {
                  dispatch(updateMessage({
                    id: assistantMessageId,
                    updates: {
                      products: chunk.data.products,
                      total_found: chunk.data.total_found,
                    }
                  }));
                }
                break;
              case 'done':
                dispatch(updateStreamingMessage({ content: '', isComplete: true }));
                dispatch(setStreaming(false));
                break;
              case 'error':
                console.error('Streaming error:', chunk.error);
                dispatch(setStreaming(false));
                break;
            }
          },
        }));
      } else {
        // Handle regular message
        await dispatch(sendMessage({
          message: messageContent,
          userId: user?.userId?.toString(),
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Focus back to input
    textareaRef.current?.focus();
  }, [inputMessage, loading, streaming, enableStreaming, dispatch, user?.userId, messages]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    sendQuickMessage: (message: string) => {
      setInputMessage(message);
      // Tự động gửi sau khi set message
      setTimeout(() => {
        if (!loading && !streaming && message.trim()) {
          // Manually trigger send logic
          const messageContent = message.trim();
          setInputMessage('');

          // Add user message to state
          dispatch(addUserMessage({ content: messageContent }));

          // Send message logic
          if (enableStreaming) {
            dispatch(setStreaming(true));
            
            const assistantMessageId = uuidv4();
            const assistantMessage: ChatMessage = {
              id: assistantMessageId,
              role: MessageRole.ASSISTANT,
              content: '',
              timestamp: new Date().toISOString(),
              status: MessageStatus.SENDING,
            };
            dispatch(addAssistantMessage(assistantMessage));

            dispatch(sendStreamMessage({
              message: messageContent,
              userId: user?.userId?.toString(),
              onChunk: (chunk: any) => {
                switch (chunk.type) {
                  case 'content':
                    dispatch(updateStreamingMessage({ content: chunk.content }));
                    break;
                  case 'products':
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.id === assistantMessageId) {
                      dispatch(updateMessage({
                        id: assistantMessageId,
                        updates: {
                          products: chunk.data.products,
                          total_found: chunk.data.total_found,
                        }
                      }));
                    }
                    break;
                  case 'done':
                    dispatch(updateStreamingMessage({ content: '', isComplete: true }));
                    dispatch(setStreaming(false));
                    break;
                  case 'error':
                    console.error('Streaming error:', chunk.error);
                    dispatch(setStreaming(false));
                    break;
                }
              },
            }));
          } else {
            dispatch(sendMessage({
              message: messageContent,
              userId: user?.userId?.toString(),
            }));
          }
        }
      }, 50);
    }
  }), [loading, streaming, enableStreaming, dispatch, user?.userId, messages]);

  // Theo dõi thay đổi số lượng tin nhắn
  useEffect(() => {
    const hasMessages = messages.length > 0;
    onMessagesChange?.(hasMessages);
  }, [messages.length, onMessagesChange]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize session on mount
  useEffect(() => {
    if (isAuthenticated && !currentSession) {
      dispatch(createNewSession({ userId: user?.userId?.toString() }));
    }
  }, [dispatch, isAuthenticated, currentSession, user?.userId]);

  // Load conversation history
  useEffect(() => {
    if (isAuthenticated && user?.userId && showConversationHistory) {
      dispatch(getConversationHistory({ userId: user.userId.toString(), limit: 20 }));
    }
  }, [dispatch, isAuthenticated, user?.userId, showConversationHistory]);

  // Handle key down for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    dispatch(clearSession());
    dispatch(createNewSession({ userId: user?.userId?.toString() }));
    setShowHistory(false);
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    dispatch(deleteConversation(conversationId));
  };

  // Clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className={`relative flex h-full ${className}`}>
      {/* Conversation History Sidebar */}
      {showConversationHistory && (
        <div className={`absolute md:relative inset-y-0 left-0 w-full md:w-80 bg-gradient-to-b from-emerald-50 to-green-50 border-r border-emerald-200 transition-transform duration-300 z-20 ${
          showHistory ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-4 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-emerald-800">Lịch sử trò chuyện</h3>
              <button
                onClick={handleNewConversation}
                className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-md text-sm hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                Mới
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full pb-20">
            {conversationsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation: any) => (
                  <div
                    key={conversation.conversation_id}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      currentSession?.conversation_id === conversation.conversation_id
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 shadow-sm'
                        : 'bg-white hover:bg-emerald-50 shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => {
                      // Load conversation logic here
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-emerald-600">
                            {conversation.conversation_type}
                          </span>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2 text-gray-700">
                          {conversation.last_message_preview || 'Cuộc trò chuyện mới'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-emerald-500">
                            {new Date(conversation.updated_at).toLocaleDateString('vi-VN')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (typeof conversation.conversation_id === 'string') {
                                handleDeleteConversation(conversation.conversation_id);
                              }
                            }}
                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for mobile sidebar */}
      {showConversationHistory && showHistory && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 z-10"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col bg-white z-0">
        {/* Header */}
        {showConversationHistory && (
          <div className="p-4 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="md:hidden p-2 hover:bg-emerald-100 rounded-md transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </button>
                <Bot className="w-8 h-8 text-emerald-500" />
                <div>
                  <h2 className="font-semibold text-emerald-800">Chat AI Assistant</h2>
                  <p className="text-sm text-emerald-600">
                    {currentSession?.conversation_type || 'Trò chuyện chung'}
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-emerald-50">
          {messages.length === 0 ? (
            <div className="text-center text-emerald-600 mt-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-lg mb-2 font-semibold">Chào mừng bạn đến với AI Shopping Assistant!</p>
              <p className="text-sm text-emerald-500">Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn</p>
            </div>
          ) : (
            messages.map((message: ChatMessage) => (
              <MessageComponent
                key={message.id}
                message={message}
                showProductCards={showProductCards}
              />
            ))
          )}
          
          {(loading || streaming) && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-white border border-emerald-100 shadow-md">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-emerald-200 bg-white">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn của bạn... (Shift + Enter để xuống dòng)"
              className="flex-1 px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none overflow-hidden min-h-[48px] max-h-[200px] chat-input"
              disabled={loading || streaming}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading || streaming}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none self-end"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Message Component
interface MessageComponentProps {
  message: ChatMessage;
  showProductCards: boolean;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, showProductCards }) => {
  const isUser = message.role === MessageRole.USER;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
            isUser 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
              : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600'
          }`}>
            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {/* Message bubble */}
            <div className={`inline-block px-4 py-3 rounded-2xl max-w-full shadow-md transition-all hover:shadow-lg ${
              isUser 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                : 'bg-white text-gray-800 border border-emerald-100'
            }`}>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Loại bỏ message status cho user - không hiển thị "đang gửi" */}
              {message.status === MessageStatus.ERROR && isUser && (
                <div className="text-red-300 text-xs mt-2">
                  Gửi thất bại
                </div>
              )}
            </div>
            
            {/* Products */}
            {!isUser && showProductCards && message.products && message.products.length > 0 && (
              <div className="mt-4">
                <ProductCardsComponent products={message.products} />
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`text-xs text-emerald-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
              {message.confidence && (
                <span className="ml-2">• Độ tin cậy: {(message.confidence * 100).toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Cards Component
interface ProductCardsComponentProps {
  products: ProductSchema[];
}

const ProductCardsComponent: React.FC<ProductCardsComponentProps> = ({ products }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
        <ShoppingCart className="w-5 h-5" />
        <span className="font-medium">Tìm thấy {products.length} sản phẩm phù hợp</span>
        <Sparkles className="w-4 h-4 text-emerald-500" />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((product, index) => (
          <ProductCard key={product.id || index} product={product} />
        ))}
      </div>
      
      {products.length > 6 && (
        <div className="text-center">
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105">
            Xem thêm {products.length - 6} sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

// Product Card Component - Fixed version
interface ProductCardProps {
  product: ProductSchema;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getRatingStars = (rating: number = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleViewDetail = (slug: string) => {
    window.open(`${slug}`, "_blank");
  };

  // ✅ FIXED: Price display logic with correct property names
  const renderPrice = () => {
    // Use correct property names (snake_case from API)
    const minPrice = product.minPrice;
    const maxPrice = product.maxPrice;
    
    // If both min and max prices exist and are different
    if (minPrice && maxPrice && minPrice !== maxPrice) {
      return (
        <div className="flex items-center gap-2">
          {/* Min price - red and prominent */}
          <span className="text-red-600 font-bold text-sm">
            {formatPrice(minPrice)}
          </span>
          {/* Max price - struck through and muted, smaller size */}
          <span className="text-gray-400 line-through text-[13px]">
            {formatPrice(maxPrice)}
          </span>

        </div>

      );
    }
    
    // If only one price exists or they're the same
    if (minPrice || maxPrice) {
      return (
        <div className="text-lg font-bold text-emerald-600">
          {formatPrice(minPrice || maxPrice)}
        </div>
      );
    }
    
    // No price available
    return (
      <div className="text-lg font-bold text-gray-500">
        Liên hệ
      </div>
    );
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    const minPrice = product.minPrice;
    const maxPrice = product.maxPrice;
    
    if (minPrice && maxPrice && minPrice !== maxPrice) {
      return Math.round(((maxPrice - minPrice) / maxPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
      {/* Product Image */}
      <div className="relative w-full h-40 mb-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg overflow-hidden">
        {!imageError && product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-emerald-300" />
          </div>
        )}
        
        {/* Like button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
        </button>
        
        {/* Similarity badge */}
        {product.similarity_score && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {(product.similarity_score * 100).toFixed(0)}% khớp
          </div>
        )}

        {/* Discount badge - if there's a price difference */}
        {getDiscountPercentage() > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            -{getDiscountPercentage()}%
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm line-clamp-2 text-gray-800 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h4>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {getRatingStars()}
            <span className="text-xs text-gray-500 ml-1">(4.5)</span>
          </div>
        </div>
        
        {product.category && (
          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
            {product.category}
          </span>
        )}
        
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* ✅ FIXED: Price display with smaller muted text */}
        <div className="space-y-1">
          {renderPrice()}
        </div>
        
        {/* Store and Stock */}
        <div className="flex items-center justify-between text-xs">
          {product.store && (
            <div className="flex items-center gap-1 text-gray-600">
              <Shield className="w-3 h-3" />
              <span>{product.store}</span>
            </div>
          )}
          
          {product.total_stock !== undefined && (
            <span className={`flex items-center gap-1 ${product.total_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <Package className="w-3 h-3" />
              {product.total_stock > 0 ? `Còn ${product.total_stock}` : 'Hết hàng'}
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleViewDetail(product.url ? product.url : '')}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 cursor-pointer to-green-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            disabled={!product.url}
          >
            <ExternalLink className="w-3 h-3" />
            Xem chi tiết
          </button>
          
          <button className="px-3 py-2 border border-emerald-300 text-emerald-600 text-sm rounded-lg hover:bg-emerald-50 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;