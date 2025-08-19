import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Mic, Paperclip, MoreVertical, Phone, Video, Info } from 'lucide-react';
import {
  getStoreConversations,
  getMessagesByConversation,
  sendMessageRest,
  connectWebSocket,
  disconnectWebSocket,
  sendMessageWebSocket,
  subscribeToConversation,
  setOnMessageReceived,
  setOnNotificationReceived,
  ConversationDTO,
  ChatMessageDTO
} from '@/services/ChatService';

const ChatInterface: React.FC = () => {
  // Lấy từ localStorage thay vì hardcode
  const [storeId, setStoreId] = useState<number | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const conversationUnsubscribers = useRef<Record<number, () => void>>({});
  const [lastMessages, setLastMessages] = useState<Record<number, ChatMessageDTO>>({});

  // Khởi tạo storeId và ownerId từ localStorage
  useEffect(() => {
    try {
      // Lấy userId từ localStorage
      const userIdFromStorage = localStorage.getItem('userId');
      const parsedUserId = userIdFromStorage ? parseInt(userIdFromStorage) : null;
      
      // Lấy storeIds từ localStorage
      const storeIdsFromStorage = localStorage.getItem('storeIds');
      let parsedStoreIds: number[] = [];
      
      if (storeIdsFromStorage) {
        try {
          parsedStoreIds = JSON.parse(storeIdsFromStorage);
        } catch {
          // Nếu không parse được JSON, thử parse như number
          const singleStoreId = parseInt(storeIdsFromStorage);
          if (!isNaN(singleStoreId)) {
            parsedStoreIds = [singleStoreId];
          }
        }
      }
      
      // Set giá trị
      setOwnerId(parsedUserId);
      setStoreId(parsedStoreIds.length > 0 ? parsedStoreIds[0] : null);
      
      console.log('Loaded from localStorage:', {
        userId: parsedUserId,
        storeIds: parsedStoreIds,
        selectedStoreId: parsedStoreIds[0]
      });
      
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
  }, []);

  // Kết nối WebSocket khi có ownerId
  useEffect(() => {
    if (!ownerId) return;

    // Đặt callback nhận tin nhắn realtime từ user queue
    setOnMessageReceived((message: ChatMessageDTO) => {
      console.log('[Chat] Received message via user queue:', message);
      
      // Nếu là tin nhắn của conversation đang mở, thêm vào messages
      if (message.conversationId === selectedConversation?.id) {
        setMessages(prev => {
          // Tránh duplicate - kiểm tra cả ID thực và nội dung
          const isDuplicate = prev.some(m => 
            (m.id && message.id && m.id === message.id) ||
            (m.senderId === message.senderId && 
             m.messageText === message.messageText && 
             Math.abs(new Date(m.createdAt || '').getTime() - new Date(message.createdAt || '').getTime()) < 5000)
          );
          
          if (isDuplicate) return prev;
          
          // Nếu có tin nhắn optimistic cùng nội dung, thay thế nó
          const optimisticIndex = prev.findIndex(m => 
            m.id && m.id < 0 && 
            m.senderId === message.senderId && 
            m.messageText === message.messageText
          );
          
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = message;
            return updated;
          }
          
          return [...prev, message];
        });
      } else if (message.conversationId) {
        // Cập nhật unread count cho conversation khác
        setUnreadCounts(prev => ({
          ...prev,
          [message.conversationId!]: (prev[message.conversationId!] || 0) + 1
        }));
        
        // Cập nhật tin nhắn cuối cùng cho conversation
        setLastMessages(prev => ({
          ...prev,
          [message.conversationId!]: message
        }));
      }
    });

    // Đặt callback nhận notification
    setOnNotificationReceived((notification) => {
      console.log('[Chat] Received notification via WebSocket:', notification);
    });

    // Kết nối WebSocket
    connectWebSocket(
      ownerId,
      () => {
        setWsConnected(true);
        console.log('[Chat] WebSocket connected successfully');
      },
      (error) => {
        setWsConnected(false);
        console.error('[Chat] WebSocket connection error:', error);
      }
    );

    // Cleanup khi component unmount
    return () => {
      disconnectWebSocket();
      setWsConnected(false);
    };
  }, [ownerId, selectedConversation]);

  // Subscribe to all conversations for realtime updates
  useEffect(() => {
    if (!conversations.length || !wsConnected) return;

    // Cleanup previous subscriptions
    Object.values(conversationUnsubscribers.current).forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        console.error('Error unsubscribing:', e);
      }
    });
    conversationUnsubscribers.current = {};

    // Subscribe to all conversations
    conversations.forEach(conv => {
      const unsubscribe = subscribeToConversation(conv.id, (message: ChatMessageDTO) => {
        console.log(`[Chat] Received message from conversation ${conv.id}:`, message);
        
        // If this message is for the currently open conversation
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages(prev => {
            // Tránh duplicate với logic tương tự như user queue
            const isDuplicate = prev.some(m => 
              (m.id && message.id && m.id === message.id) ||
              (m.senderId === message.senderId && 
               m.messageText === message.messageText && 
               Math.abs(new Date(m.createdAt || '').getTime() - new Date(message.createdAt || '').getTime()) < 5000)
            );
            
            if (isDuplicate) return prev;
            
            // Thay thế tin nhắn optimistic nếu có
            const optimisticIndex = prev.findIndex(m => 
              m.id && m.id < 0 && 
              m.senderId === message.senderId && 
              m.messageText === message.messageText
            );
            
            if (optimisticIndex !== -1) {
              const updated = [...prev];
              updated[optimisticIndex] = message;
              return updated;
            }
            
            return [...prev, message];
          });
        } else if (message.conversationId) {
          // Update unread count for other conversations
          setUnreadCounts(prev => ({
            ...prev,
            [message.conversationId!]: (prev[message.conversationId!] || 0) + 1
          }));
          
          // Cập nhật tin nhắn cuối cùng cho conversation
          setLastMessages(prev => ({
            ...prev,
            [message.conversationId!]: message
          }));
        }

        // Update conversation updatedAt and reorder
        setConversations(prev => {
          const updated = prev.map(c => 
            c.id === message.conversationId 
              ? { ...c, updatedAt: new Date().toISOString() }
              : c
          );
          
          // Move updated conversation to top
          const targetConv = updated.find(c => c.id === message.conversationId);
          if (!targetConv) return updated;
          
          const others = updated.filter(c => c.id !== message.conversationId);
          return [targetConv, ...others];
        });
      });

      conversationUnsubscribers.current[conv.id] = unsubscribe;
    });

    return () => {
      // Cleanup subscriptions when conversations change
      Object.values(conversationUnsubscribers.current).forEach(unsub => {
        try {
          unsub();
        } catch (e) {
          console.error('Error unsubscribing:', e);
        }
      });
      conversationUnsubscribers.current = {};
    };
  }, [conversations, wsConnected, selectedConversation]);

  // Lấy danh sách cuộc trò chuyện của shop
  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    console.log('Loading store conversations for storeId:', storeId);
    setIsLoading(true);
    
    getStoreConversations(storeId)
      .then(response => {
        console.log('API Response:', response);
        console.log('Conversations data:', response.data);
        
        const data = Array.isArray(response.data) ? response.data : [];
        setConversations(data);
        
        if (data.length > 0) {
          console.log('Setting first conversation:', data[0]);
          setSelectedConversation(data[0]);
        }
        
        setError('');
      })
      .catch(error => {
        console.error('Error loading conversations:', error);
        console.error('Error response:', error.response);
        setError('Không thể tải danh sách cuộc trò chuyện');
        setConversations([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [storeId]);

  // Lấy tin nhắn khi chọn conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log('Loading messages for conversation:', selectedConversation.id);
      
      getMessagesByConversation(selectedConversation.id)
        .then(response => {
          console.log('Messages data:', response.data);
          const messages = response.data || [];
          setMessages(messages);
          
          // Cập nhật tin nhắn cuối cùng cho conversation này
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            setLastMessages(prev => ({
              ...prev,
              [selectedConversation.id]: lastMessage
            }));
          }
        })
        .catch(error => {
          console.error('Error loading messages:', error);
          setMessages([]);
        });
    }
  }, [selectedConversation]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConversation || !ownerId) return;
    
    try {
      // Xác định receiverId là customerId của conversation
      const receiverId = selectedConversation.customerId;
      const newMessage: ChatMessageDTO = {
        senderId: ownerId,
        receiverId: receiverId,
        messageText: inputText,
        conversationId: selectedConversation.id
      };
      
      console.log('Sending message:', newMessage);
      
      // Gửi tin nhắn qua WebSocket nếu đã kết nối
      if (wsConnected) {
        // Gửi tin nhắn trước khi thêm optimistic update
        sendMessageWebSocket(newMessage);
        
        // Optimistic update với delay nhỏ để tránh race condition
        setTimeout(() => {
          setMessages(prev => {
            // Kiểm tra xem tin nhắn thực đã có chưa
            const realMessageExists = prev.some(m => 
              m.id && m.id > 0 && 
              m.senderId === newMessage.senderId && 
              m.messageText === newMessage.messageText &&
              Math.abs(new Date(m.createdAt || '').getTime() - Date.now()) < 10000
            );
            
            if (realMessageExists) return prev;
            
            const tempMessage: ChatMessageDTO = {
              ...newMessage,
              id: Date.now() * -1,
              createdAt: new Date().toISOString()
            };
            
            return [...prev, tempMessage];
          });
        }, 100);
      } else {
        // Fallback: gửi qua REST API nếu WebSocket chưa kết nối
        const response = await sendMessageRest(newMessage);
        console.log('Message sent successfully via REST:', response.data);
        setMessages(prev => [...prev, response.data]);
      }
      
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Kiểm tra thông tin cần thiết
  if (!ownerId || !storeId) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {!ownerId ? 'Không tìm thấy thông tin người dùng.' : 'Không tìm thấy thông tin cửa hàng.'}
          </p>
          <p className="text-gray-600 mb-4">
            Vui lòng đăng nhập lại hoặc kiểm tra quyền truy cập.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Plus size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-4 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            Store ID: {storeId} | Owner ID: {ownerId}
            <br />
            WebSocket: <span className={wsConnected ? 'text-green-500' : 'text-red-500'}>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  // Reset unread count for this conversation
                  setUnreadCounts(prev => ({ ...prev, [conv.id]: 0 }));
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {`Customer #${conv.customerId}`}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {unreadCounts[conv.id] > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {unreadCounts[conv.id] > 99 ? '99+' : unreadCounts[conv.id]}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">#{conv.id}</span>
                      </div>
                    </div>
                    {/* Hiển thị tin nhắn cuối cùng */}
                    {lastMessages[conv.id] ? (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        <span className={`font-medium ${lastMessages[conv.id].senderId === ownerId ? 'text-blue-600' : 'text-gray-800'}`}>
                          {lastMessages[conv.id].senderId === ownerId ? 'Bạn: ' : 'Khách: '}
                        </span>
                        {lastMessages[conv.id].messageText}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Chưa có tin nhắn
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString('vi-VN') : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                👤
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedConversation ? `Customer #${selectedConversation.customerId}` : 'Chọn cuộc trò chuyện'}
                </h2>
                <p className={`text-sm ${wsConnected ? 'text-green-500' : 'text-gray-500'}`}>
                  {wsConnected ? 'Online (Realtime)' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Info size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                {selectedConversation ? 'Chưa có tin nhắn nào' : 'Chọn một cuộc trò chuyện để bắt đầu'}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === ownerId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.senderId === ownerId
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.messageText}</p>
                    <p 
                      className={`text-xs mt-1 ${
                        message.senderId === ownerId ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Paperclip size={20} className="text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedConversation ? "Type a message..." : "Chọn cuộc trò chuyện để gửi tin nhắn"}
                disabled={!selectedConversation}
                className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Mic size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!selectedConversation || !inputText.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;