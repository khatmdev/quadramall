import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  ShoppingBag,
  Truck,
  CreditCard,
  Shield,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Sparkles,
  Bot,
  Gift,
} from 'lucide-react';
import ChatComponent, { ChatComponentRef } from './ChatComponent';

interface QuickMessage {
  id: string;
  text: string;
  icon: React.ReactNode;
  gradient: string;
}

const MiniChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Thay đổi giá trị mặc định thành 1/2.5 của chiều rộng màn hình
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth / 2;
    }
    return 500; // fallback cho server-side rendering
  });
  const [isResizing, setIsResizing] = useState(false);
  const [justFinishedResizing, setJustFinishedResizing] = useState(false);
  const [showAllQuickMessages, setShowAllQuickMessages] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatComponentRef = useRef<ChatComponentRef>(null);

  const quickMessages: QuickMessage[] = [
    {
      id: '1',
      text: 'Chính sách giao hàng và đổi trả',
      icon: <Truck className="w-4 h-4" />,
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      id: '2',
      text: 'Tôi cần mua iPhone mới nhất',
      icon: <Smartphone className="w-4 h-4" />,
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      id: '3',
      text: 'Laptop gaming tốt nhất trong tầm giá',
      icon: <Laptop className="w-4 h-4" />,
      gradient: 'from-teal-400 to-cyan-500',
    },
    {
      id: '4',
      text: 'Smartwatch cho thể thao',
      icon: <Watch className="w-4 h-4" />,
      gradient: 'from-emerald-400 to-green-500',
    },
    {
      id: '5',
      text: 'Tai nghe không dây tốt nhất',
      icon: <Headphones className="w-4 h-4" />,
      gradient: 'from-green-400 to-teal-500',
    },
    {
      id: '6',
      text: 'Hướng dẫn thanh toán online',
      icon: <CreditCard className="w-4 h-4" />,
      gradient: 'from-teal-400 to-emerald-500',
    },
    {
      id: '7',
      text: 'Chương trình khuyến mãi hiện tại',
      icon: <Gift className="w-4 h-4" />,
      gradient: 'from-emerald-400 to-green-600',
    },
    {
      id: '8',
      text: 'Bảo hành và chăm sóc khách hàng',
      icon: <Shield className="w-4 h-4" />,
      gradient: 'from-green-500 to-teal-600',
    },
  ];

  const handleQuickMessage = (message: string) => {
    setHasMessages(true);
    setShowAllQuickMessages(false);
    if (chatComponentRef.current) {
      chatComponentRef.current.sendQuickMessage(message);
    }
  };

  // Thêm useEffect để cập nhật chatWidth khi resize window
  useEffect(() => {
    const handleResize = () => {
      if (!isResizing) {
        setChatWidth(window.innerWidth / 2.5);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const minWidth = window.innerWidth / 2
      const maxWidth = window.innerWidth * 0.8;

      setChatWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isResizing) {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(false);
        setJustFinishedResizing(true);
        setTimeout(() => setJustFinishedResizing(false), 100);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isResizing && !justFinishedResizing) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={resizeRef}
        className="absolute top-0 bottom-0 w-2 cursor-col-resize hover:bg-green-400 hover:bg-opacity-30 transition-colors z-10"
        style={{ right: chatWidth }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
      <div
        className={`bg-white h-full shadow-2xl flex flex-col relative chat-container ${isResizing ? 'chat-resizing' : ''}`}
        style={{ width: chatWidth }}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Shopping Assistant</h3>
              <p className="text-emerald-100 text-sm">Trợ lý mua sắm thông minh</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-b">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Xin chào! Tôi là AI Shopping Assistant 🛍️
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tôi có thể giúp bạn tìm kiếm sản phẩm, so sánh giá cả, tư vấn mua sắm, 
                và trả lời mọi câu hỏi về chính sách của cửa hàng. Hãy chọn một chủ đề 
                dưới đây hoặc nhắn tin trực tiếp!
              </p>
            </div>
          </div>
        </div>
        {!hasMessages && (
          <div className="p-3 border-b bg-gradient-to-r from-emerald-50 to-green-50">
            <h5 className="font-medium text-emerald-700 mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Gợi ý nhanh
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {quickMessages.slice(0, 4).map((msg) => (
                <button
                  key={msg.id}
                  className="p-2 rounded-lg text-left hover:scale-[1.02] transition-all duration-200 bg-white border border-emerald-200 hover:border-emerald-300 hover:shadow-sm group"
                  onClick={() => {
                    handleQuickMessage(msg.text);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-emerald-500 group-hover:text-emerald-600">
                      {msg.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700 line-clamp-1">{msg.text}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 text-center">
              <button
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                onClick={() => setShowAllQuickMessages(!showAllQuickMessages)}
              >
                {showAllQuickMessages ? 'Ẩn bớt' : 'Xem thêm...'}
              </button>
            </div>
            {showAllQuickMessages && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quickMessages.slice(4).map((msg) => (
                  <button
                    key={msg.id}
                    className="p-2 rounded-lg text-left hover:scale-[1.02] transition-all duration-200 bg-white border border-emerald-200 hover:border-emerald-300 hover:shadow-sm group"
                    onClick={() => {
                      handleQuickMessage(msg.text);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-emerald-500 group-hover:text-emerald-600">
                        {msg.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 line-clamp-1">{msg.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <ChatComponent
            ref={chatComponentRef}
            className="h-full"
            enableStreaming={false}
            showProductCards={true}
            showConversationHistory={false}
            onMessagesChange={setHasMessages}
          />
        </div>
      </div>
    </div>
  );
};

export default MiniChat;