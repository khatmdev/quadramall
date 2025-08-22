import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { ChatService } from '@/api/ChatService';
import { uploadImage, uploadVideo } from '@/api/cloudinary/uploadService';
import { ChatMessage, Conversation, Notification } from '@/types/chat';
import { api } from '@/main';
import { toast } from '@/lib/toast';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';
// TODO: Import auth context khi có
// import { useAuth } from '@/context/AuthContext';

type BackendErrorPayload = { message?: string; error?: string };

// Extended interfaces for UI - mapping with backend DTOs
interface ExtendedConversation extends Conversation {
  storeName?: string;
  pinned?: boolean;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

interface ExtendedChatMessage extends ChatMessage {
  content: string; // Map from backend 'messageText' field
  timestamp: string; // Map from backend timestamp
  read?: boolean;
}

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Helpers to persist store info (name + logoUrl) per conversation locally to survive reloads
// Shape: Record<conversationId, { name?: string; logoUrl?: string }>
const STORE_NAME_MAP_KEY = 'chat_store_info_map_v1';
type StoreInfoMap = Record<number, { name?: string; logoUrl?: string }>;
const readStoreInfoMap = (): StoreInfoMap => {
  try {
    const raw = localStorage.getItem(STORE_NAME_MAP_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoreInfoMap;
  } catch {
    return {};
  }
};
const saveStoreInfoToMap = (conversationId: number, payload: { name?: string; logoUrl?: string }) => {
  try {
    const map = readStoreInfoMap();
    map[conversationId] = { ...(map[conversationId] || {}), ...payload };
    localStorage.setItem(STORE_NAME_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

const ChatInterface: React.FC = () => {
  // Hooks luôn ở đầu component
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'pinned'>('all');
  const [chatService] = useState(() => new ChatService(api));
  const currentSubscribedConvRef = useRef<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  
  // Helper to add a message only if it's not already present to avoid duplicates
  const addMessageIfNotExists = (msg: ExtendedChatMessage) => {
    setMessages(prev => {
      // If id exists, dedupe by id
      if (msg.id != null) {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      }
      // If no id, try dedupe by timestamp + sender + content
      if (prev.some(m => m.timestamp === msg.timestamp && m.senderId === msg.senderId && m.content === msg.content)) return prev;
      return [...prev, msg];
    });
  };

  const user = getCurrentUser();
  const customerId = user && user.userId ? Number(user.userId) : null;

  useEffect(() => {
    if (!customerId) return;
  const initializeChat = async () => {
      try {
        // Connect WebSocket
        chatService.connect(
          customerId,
          () => {
            console.log('ChatService: WebSocket connected successfully');
            toast.success('Kết nối chat thành công');
          },
          (error) => {
            console.error('ChatService: WebSocket connection error:', error);
            toast.error('Không thể kết nối chat. Tin nhắn sẽ vẫn được lưu qua REST.');
          }
        );

        // Set up message received callback
        chatService.setOnMessageReceived((message: ChatMessage) => {
          console.log('ChatService: New message received:', message);
          const extendedMessage: ExtendedChatMessage = {
            ...message,
            content: message.messageText || '',
            timestamp: message.createdAt || new Date().toISOString()
          };
          addMessageIfNotExists(extendedMessage);
          
          // Update last message in conversation
          setConversations(prev => 
            prev.map(conv => 
              conv.id === message.conversationId 
                ? { ...conv, lastMessage: { content: extendedMessage.content, timestamp: extendedMessage.timestamp } }
                : conv
            )
          );
        });

        // Set up notification received callback
        chatService.setOnNotificationReceived((notification: Notification) => {
          console.log('ChatService: New notification received:', notification);
          const t = notification.type?.toUpperCase?.();
          if (t === 'ERROR') {
            toast.error(notification.content);
          } else {
            toast.success(notification.content);
          }
        });

        // Try to load user conversations (will be empty if endpoint not implemented)
        console.log('Attempting to load conversations for customer:', customerId);
        const userConversations = await chatService.getUserConversations(customerId);
        console.log('Loaded conversations:', userConversations);
        
        // Fetch store info for each conversation
        const conversationsWithStore: ExtendedConversation[] = [];
        for (const conv of userConversations) {
          console.log('Processing conversation:', conv);
          try {
            const storeInfo = await chatService.getStoreInfo(conv.storeId);
            console.log('Store info for', conv.storeId, ':', storeInfo);
            const persisted = readStoreInfoMap()[conv.id as number] || {};
            conversationsWithStore.push({
              ...conv,
              storeName: storeInfo?.name || persisted.name || `Cửa hàng #${conv.storeId}`,
              // attach logoUrl if backend provides it
              // @ts-expect-error - extended field on conversation (backend returns logoUrl)
              logoUrl: storeInfo?.logoUrl || persisted.logoUrl,
            });
          } catch (error) {
            console.warn(`Could not fetch store info for store ${conv.storeId}:`, error);
            const persisted = readStoreInfoMap()[conv.id as number] || {};
            conversationsWithStore.push({
              ...conv,
              storeName: persisted.name || `Cửa hàng #${conv.storeId}`,
              // @ts-expect-error - persisted value might contain logo
              logoUrl: persisted.logoUrl,
            });
          }
        }
        
        console.log('Final conversations with store info:', conversationsWithStore);
        // Merge with any existing conversations in state and localStorage map to preserve storeName
    const storedMap = readStoreInfoMap();
        setConversations(prev => {
          const prevMap = new Map<number, ExtendedConversation>();
          prev.forEach(p => { if (p.id != null) prevMap.set(p.id, p); });
          return conversationsWithStore.map(conv => {
            const existing = conv.id != null ? prevMap.get(conv.id) : undefined;
    if (existing && existing.storeName) return { ...conv, storeName: existing.storeName };
  if (conv.id != null && storedMap[conv.id]) return { ...conv, storeName: storedMap[conv.id].name, logoUrl: storedMap[conv.id].logoUrl };
            return conv;
          });
        });
        
        // Fetch unread notifications and show a summary
        try {
          const unread = await chatService.getNotifications(customerId);
          // Filter notifications where isRead = false
          const unreadCount = unread.filter(notif => !notif.isRead).length;
          if (unreadCount > 0) {
            toast.success(`Bạn có ${unreadCount} thông báo chưa đọc`);
          }
        } catch {
          // ignore
        }
        
        console.log('ChatService: Initialization completed successfully');
      } catch (error) {
        console.error('ChatService: Error initializing chat:', error);
        toast.error('Không thể khởi tạo chat');
      }
    };
    initializeChat();

    // Cleanup on unmount
    return () => {
      // Unsubscribe current conversation if any
      if (currentSubscribedConvRef.current) {
        chatService.unsubscribeConversation(currentSubscribedConvRef.current);
        currentSubscribedConvRef.current = null;
      }
      chatService.disconnect();
      toast.error('Mất kết nối chat');
    };
  }, [chatService, customerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConversationSelect = React.useCallback(async (conversationId: number) => {
    console.log('Selecting conversation:', conversationId);
    // Unsubscribe previous conversation subscription if exists
    if (currentSubscribedConvRef.current && currentSubscribedConvRef.current !== conversationId) {
      chatService.unsubscribeConversation(currentSubscribedConvRef.current);
      currentSubscribedConvRef.current = null;
    }

    setSelectedConversation(conversationId);
    
    try {
      // Load messages for selected conversation
      console.log('Loading messages for conversation:', conversationId);
      const convMessages = await chatService.getMessages(conversationId);
      console.log('Loaded messages:', convMessages);
      
      // Map backend messages to extended format
      const mappedMessages: ExtendedChatMessage[] = convMessages.map(msg => ({
        ...msg,
        content: msg.messageText || '',
        timestamp: msg.createdAt || new Date().toISOString()
      }));
      
      console.log('Mapped messages:', mappedMessages);
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }

  // Subscribe to conversation topic for realtime messages
    try {
      chatService.subscribeConversation(conversationId, (message: ChatMessage) => {
        // Only handle messages for the currently selected conversation
        if (message.conversationId !== conversationId) return;
        const extendedMessage: ExtendedChatMessage = {
          ...message,
          content: message.messageText || '',
          timestamp: message.createdAt || new Date().toISOString(),
        };
  addMessageIfNotExists(extendedMessage);

        // Update last message in conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === message.conversationId
              ? { ...conv, lastMessage: { content: extendedMessage.content, timestamp: extendedMessage.timestamp } }
              : conv
          )
        );
      });
      currentSubscribedConvRef.current = conversationId;
    } catch (e) {
      console.warn('Could not subscribe to conversation topic', e);
    }

    // Ensure selected conversation has a storeName (fetch if missing)
    try {
      const existingConv = conversations.find(c => c.id === conversationId);
      if (existingConv && !existingConv.storeName) {
        try {
          const storeInfo = await chatService.getStoreInfo(existingConv.storeId);
          setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, storeName: storeInfo?.name || `Cửa hàng #${existingConv.storeId}` } : c));
        } catch {
          setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, storeName: `Cửa hàng #${existingConv.storeId}` } : c));
        }
      }
    } catch {
      // ignore
    }

    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [chatService, conversations]);

  // If page opened with storeId in query params, try to get or create conversation and open it
  useEffect(() => {
    const openConversationFromQuery = async () => {
      if (!customerId) return;
      const storeIdParam = searchParams.get('storeId');
      if (!storeIdParam) return;
      const storeId = Number(storeIdParam);
      if (Number.isNaN(storeId)) return;

      try {
        const conv = await chatService.getOrCreateConversation(customerId, storeId);
        // Ensure conversation appears in list
        setConversations(prev => {
          if (prev.some(c => c.id === conv.id)) return prev;
          const storeName = searchParams.get('storeName') || `Cửa hàng #${storeId}`;
          const logoUrlParam = searchParams.get('logoUrl') || undefined;
          // persist locally (name + optional logo)
          saveStoreInfoToMap(conv.id, { name: storeName, logoUrl: logoUrlParam });
          return [...prev, { ...conv, storeName, logoUrl: logoUrlParam }];
        });

        // Select and load messages
        handleConversationSelect(conv.id);
      } catch (error) {
        console.error('Error creating or getting conversation from query param:', error);
        toast.error('Không thể mở cuộc trò chuyện với cửa hàng');
      }
    };

    openConversationFromQuery();
    // Only run when search params, customerId, or chatService change
  }, [searchParams, customerId, chatService, handleConversationSelect]);

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!selectedConversation || (!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0)) return;

    try {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) return;
      setIsSending(true);

      // Upload first image & first video (extension: could loop all & send multiple messages)
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (selectedImages[0]) {
        try {
          const res = await uploadImage(selectedImages[0]);
          if (res.status === 'success' && res.data) imageUrl = res.data;
        } catch (e) {
          console.warn('Upload image failed', e);
          toast.error('Upload ảnh thất bại');
        }
      }

      if (selectedVideos[0]) {
        try {
          const res = await uploadVideo(selectedVideos[0]);
          if (res.status === 'success' && res.data) videoUrl = res.data;
        } catch (e) {
          console.warn('Upload video failed', e);
          toast.error('Upload video thất bại');
        }
      }

      const payload: Omit<ChatMessage, 'id' | 'createdAt' | 'isRead'> = {
        conversationId: selectedConversation,
        senderId: customerId!,
        receiverId: conversation.storeId,
        messageText: newMessage.trim(),
        ...(imageUrl ? { imageUrl } : {}),
        ...(videoUrl ? { videoUrl } : {}),
      };

      const saved = await chatService.sendMessageRest(payload);
      chatService.sendMessage(saved); // fire ws broadcast if connected

      const extendedMessage: ExtendedChatMessage = {
        ...saved,
        content: saved.messageText || '',
        timestamp: saved.createdAt || new Date().toISOString(),
      };
      addMessageIfNotExists(extendedMessage);

      setConversations(prev => prev.map(conv => conv.id === saved.conversationId ? { ...conv, lastMessage: { content: extendedMessage.content, timestamp: extendedMessage.timestamp } } : conv));

      setNewMessage('');
      setSelectedImages([]);
      setSelectedVideos([]);
      toast.success('Đã gửi tin nhắn');
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      let backendMsg = 'Gửi tin nhắn thất bại';
      if (isAxiosError<BackendErrorPayload>(error)) {
        const axiosErr = error as AxiosError<BackendErrorPayload>;
        backendMsg = axiosErr.response?.data?.message || axiosErr.response?.data?.error || axiosErr.message || backendMsg;
      }
      toast.error(backendMsg);
    } finally {
      setIsSending(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedImages([...selectedImages, ...Array.from(event.target.files)]);
    }
  };

  const handleAddVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedVideos([...selectedVideos, ...Array.from(event.target.files)]);
    }
  };

  const getAvatarUrl = (senderId: number) => {
    // For now, use static avatars since we don't have user/store avatar APIs
    if (senderId === customerId) {
      return '/assets/images/default_user_avatar.jpg';
    } else {
      return '/assets/images/default_store_avatar.jpg';
    }
  };

  const getStoreLogo = () => {
    // For now, use static logo
    // TODO: Get actual store logo when store API is available
    return '/assets/images/default_store_avatar.jpg';
  };

  const getStoreLogoFromConv = (convId?: number, fallback?: string) => {
    // 1. check conversation in state
    if (convId != null) {
      const conv = conversations.find(c => c.id === convId);
      // conv may have logoUrl field from persisted map or backend
      if (conv) {
        const maybe = conv as unknown as { logoUrl?: string };
        if (maybe.logoUrl) return maybe.logoUrl;
      }
      const stored = readStoreInfoMap()[convId];
      if (stored && stored.logoUrl) return stored.logoUrl;
    }
    // 2. fallback param
    if (fallback) return fallback;
    // 3. default static
    return getStoreLogo();
  };

  // Kiểm tra đăng nhập sau khi gọi hooks
  if (!user || !customerId) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để sử dụng tính năng chat</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen flex p-4">
      {/* Nút mở sidebar trên desktop nhỏ */}
      <div className="lg:hidden mb-2">
        <button
          className="p-2 bg-gray-200 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Danh sách cuộc trò chuyện */}
      <div
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-1/3 border-r border-gray-200 bg-gray-50 transition-all duration-300`}
      >
        <h2 className="text-xl font-bold p-4 border-b border-gray-200">Tin nhắn</h2>
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => {
              const searchText = e.target.value.toLowerCase();
              // Simple search by store name - placeholder for when store API is available  
              const filteredConversations = conversations.filter(conv => 
                (conv.storeName || '').toLowerCase().includes(searchText)
              );
              // Note: In production, this should call backend search API
              console.log('Searching for:', searchText, 'Results:', filteredConversations.length);
            }}
          />
        </div>
        {/* Phần chọn tin nhắn với 3 nút */}
        <div className="p-4 border-b border-gray-200 flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilterType('all')}
          >
            Tất cả
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filterType === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilterType('unread')}
          >
            Chưa đọc
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filterType === 'pinned' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilterType('pinned')}
          >
            Đã ghim
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)]">
          {conversations.map((conv) => {
            return (
              <div
                key={conv.id}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedConversation === conv.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleConversationSelect(conv.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img
                      src={getStoreLogoFromConv(conv.id)}
                      alt={`Store Logo`}
                      className="w-10 h-10 rounded-full mr-2"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{conv.storeName || 'Cửa hàng'}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage?.content || 'Chưa có tin nhắn nào'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {conv.lastMessage 
                      ? new Date(conv.lastMessage.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khu vực chat */}
      <div className="w-full lg:w-2/3 flex flex-col h-screen">
        {selectedConversation ? (
          <>
            {/* Header với logo và tên cửa hàng */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <img
                src={getStoreLogoFromConv(selectedConversation)}
                alt="Store Logo"
                className="w-10 h-10 rounded-full mr-2"
              />
              <h2 className="text-xl font-bold">
                {conversations.find((conv) => conv.id === selectedConversation)?.storeName || 'Cửa hàng'}
              </h2>
            </div>
            {/* Khu vực hiển thị tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {(() => {
                const lastUserMessageIndex = [...messages].map((m, i) => ({ m, i }))
                  .filter(item => item.m.senderId === customerId)
                  .map(item => item.i)
                  .pop();
                return messages.map((msg, index) => {
                const isUser = msg.senderId === customerId;
                const avatarUrl = getAvatarUrl(msg.senderId);
                const isRead = msg.isRead || false;
                return (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <img
                        src={avatarUrl}
                        alt={isUser ? 'Customer' : 'Store'}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div className="flex flex-col items-end">
                      <div
                        className={`max-w-xs p-3 rounded-lg space-y-2 ${
                          isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="image"
                            className="rounded max-h-60 object-contain"
                            loading="lazy"
                          />
                        )}
                        {msg.videoUrl && (
                          <video
                            src={msg.videoUrl}
                            controls
                            className="rounded max-h-60"
                          />
                        )}
                        {msg.content && <p>{msg.content}</p>}
                        <span className={`block text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {isUser && index === lastUserMessageIndex && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                            ✓ {isRead ? 'Đã nhận' : 'Đã gửi'}
                          </span>
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <img
                        src={avatarUrl}
                        alt={isUser ? 'Customer' : 'Store'}
                        className="w-8 h-8 rounded-full ml-2"
                      />
                    )}
                  </div>
                );
                });
              })()}
            </div>
            {/* Phần nhập văn bản và nút chat - Sử dụng sticky để cố định ở dưới */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 bg-white z-10">
              {(selectedImages.length > 0 || selectedVideos.length > 0) && (
                <div className="mb-2 flex space-x-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={URL.createObjectURL(image)} alt="Preview" className="w-16 h-16 object-cover" />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-xs"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedVideos.map((video, index) => (
                    <div key={index} className="relative">
                      <video controls src={URL.createObjectURL(video)} className="w-16 h-16 object-cover" />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-xs"
                        onClick={() => handleRemoveVideo(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-500">
                    <span className="text-gray-500 text-xl">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddImage}
                    />
                  </label>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <div className="flex space-x-2 ml-2 relative" ref={emojiPickerRef}>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-10 right-24 z-10">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                  <label className="text-gray-500 hover:text-gray-700 cursor-pointer">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddImage}
                    />
                  </label>
                  <label className="text-gray-500 hover:text-gray-700 cursor-pointer">
                    🎥
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleAddVideo}
                    />
                  </label>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => alert('Xem sản phẩm của shop')}
                  >
                    🛒
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => alert('Xem đơn hàng của shop')}
                  >
                    📦
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || (!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0)}
                  className={`px-4 py-2 rounded-md ml-2 text-white ${isSending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} disabled:cursor-not-allowed`}
                >
                  {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
