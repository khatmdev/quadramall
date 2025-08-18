import React, { useState } from 'react';
import { 
  Bell, BellDot ,
  Star, ShoppingCart, CreditCard, AlertTriangle,
  Info, User, Store, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shop' | 'user' | 'system' | 'promotion' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
  relatedData?: {
    orderId?: string;
    shopId?: string;
    userId?: string;
    amount?: number;
  };
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Đơn hàng mới từ Shop ABC',
    message: 'Có 1 đơn hàng mới trị giá 2.500.000đ cần xử lý từ Shop ABC Electronics',
    type: 'order',
    priority: 'high',
    isRead: false,
    isStarred: true,
    createdAt: '2025-06-22T10:30:00Z',
    relatedData: { orderId: 'ORD-001', shopId: 'SHOP-ABC', amount: 2500000 }
  },
  {
    id: '2',
    title: 'Yêu cầu rút tiền từ Shop XYZ',
    message: 'Shop XYZ Fashion yêu cầu rút tiền số tiền 15.000.000đ',
    type: 'payment',
    priority: 'medium',
    isRead: false,
    isStarred: false,
    createdAt: '2025-06-22T09:15:00Z',
    relatedData: { shopId: 'SHOP-XYZ', amount: 15000000 }
  },
  {
    id: '3',
    title: 'Đăng ký shop mới',
    message: 'Có shop mới "Tech Gadgets Store" đăng ký tham gia nền tảng',
    type: 'shop',
    priority: 'medium',
    isRead: true,
    isStarred: false,
    createdAt: '2025-06-22T08:45:00Z',
    relatedData: { shopId: 'SHOP-NEW-001' }
  },
  {
    id: '4',
    title: 'Báo cáo vi phạm từ người dùng',
    message: 'Người dùng NguyenVanA báo cáo sản phẩm không đúng mô tả từ Shop DEF',
    type: 'user',
    priority: 'high',
    isRead: false,
    isStarred: false,
    createdAt: '2025-06-22T07:20:00Z',
    relatedData: { userId: 'USER-001', shopId: 'SHOP-DEF' }
  },
  {
    id: '5',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ bảo trì vào 02:00 ngày 23/06/2025 trong khoảng 2 tiếng',
    type: 'system',
    priority: 'low',
    isRead: true,
    isStarred: true,
    createdAt: '2025-06-21T16:00:00Z'
  },
  {
    id: '6',
    title: 'Khuyến mãi sắp hết hạn',
    message: 'Chương trình "Sale cuối tuần" sẽ kết thúc vào 23:59 hôm nay',
    type: 'promotion',
    priority: 'medium',
    isRead: true,
    isStarred: false,
    createdAt: '2025-06-22T06:00:00Z'
  },
  {
    id: '7',
    title: 'Cảnh báo bảo mật',
    message: 'Phát hiện nhiều lần đăng nhập thất bại từ IP 192.168.1.100',
    type: 'security',
    priority: 'urgent',
    isRead: false,
    isStarred: true,
    createdAt: '2025-06-22T05:30:00Z'
  }
];

// Notification Bell Component
const NotificationBell: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} className="text-blue-500" />;
      case 'payment': return <CreditCard size={16} className="text-green-500" />;
      case 'shop': return <Store size={16} className="text-purple-500" />;
      case 'user': return <User size={16} className="text-orange-500" />;
      case 'system': return <Info size={16} className="text-gray-500" />;
      case 'promotion': return <Star size={16} className="text-yellow-500" />;
      case 'security': return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellDot size={20} className="text-gray-600" />
        ) : (
          <Bell size={20} className="text-gray-600" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Thông báo</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount} mới
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                recentNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'} line-clamp-1`}>
                            {notification.title}
                          </h4>
                          {notification.priority === 'urgent' && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Link
                  to="/notification" 
                  onClick={() => {
                    setIsOpen(false);
                    onViewAll();
                  }}
                  className="w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;