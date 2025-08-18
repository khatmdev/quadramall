import React, { useMemo, useState, useEffect } from 'react';
import { 
  Bell, Star, ShoppingCart, CreditCard, AlertTriangle,
  Info, User, Store, X, EyeOff, Trash2, Search,
  Filter, Clock, Calendar, Package, CheckCircle
} from 'lucide-react';

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

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all', // all, read, unread
    priority: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const notificationTypes = [
    { value: 'all', label: 'Tất cả', icon: Bell },
    { value: 'order', label: 'Đơn hàng', icon: ShoppingCart },
    { value: 'payment', label: 'Thanh toán', icon: CreditCard },
    { value: 'shop', label: 'Shop', icon: Store },
    { value: 'user', label: 'Người dùng', icon: User },
    { value: 'system', label: 'Hệ thống', icon: Info },
    { value: 'promotion', label: 'Khuyến mãi', icon: Star },
    { value: 'security', label: 'Bảo mật', icon: AlertTriangle }
  ];

  const priorityTypes = [
    { value: 'all', label: 'Tất cả mức độ' },
    { value: 'urgent', label: 'Khẩn cấp', color: 'text-red-600' },
    { value: 'high', label: 'Cao', color: 'text-orange-600' },
    { value: 'medium', label: 'Trung bình', color: 'text-yellow-600' },
    { value: 'low', label: 'Thấp', color: 'text-gray-600' }
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = filters.type === 'all' || notification.type === filters.type;
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'read' && notification.isRead) ||
        (filters.status === 'unread' && !notification.isRead);
      const matchesPriority = filters.priority === 'all' || notification.priority === filters.priority;
      const matchesSearch = notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.message.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesType && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [notifications, filters]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const selectedType = notificationTypes.find(type => type.value === filters.type);

  const handleMarkAsRead = (ids: string[]) => {
    setNotifications(prev => 
      prev.map(notification => 
        ids.includes(notification.id) 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setSelectedIds([]);
  };

  const handleMarkAsUnread = (ids: string[]) => {
    setNotifications(prev => 
      prev.map(notification => 
        ids.includes(notification.id) 
          ? { ...notification, isRead: false }
          : notification
      )
    );
    setSelectedIds([]);
  };

  const handleToggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isStarred: !notification.isStarred }
          : notification
      )
    );
  };

  const handleDelete = (ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds([]);
    if (selectedNotification && ids.includes(selectedNotification.id)) {
      setSelectedNotification(null);
    }
  };

  const handleDeleteAllRead = () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id);
    handleDelete(readIds);
  };

  // Automatically mark notification as read when selected
  useEffect(() => {
    if (selectedNotification && !selectedNotification.isRead) {
      handleMarkAsRead([selectedNotification.id]);
      setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
    }
  }, [selectedNotification]);

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { label: 'Khẩn cấp', className: 'bg-red-100 text-red-700' },
      high: { label: 'Cao', className: 'bg-orange-100 text-orange-700' },
      medium: { label: 'Trung bình', className: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Thấp', className: 'bg-gray-100 text-gray-700' }
    };
    
    const priorityConfig = config[priority as keyof typeof config];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.className}`}>
        {priorityConfig.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Main List */}
      <div className={`${selectedNotification ? 'hidden lg:block' : ''} flex-1 overflow-y-auto bg-white border-r`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b bg-white sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} thông báo chưa đọc • {filteredNotifications.length} tổng cộng
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={handleDeleteAllRead}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Xóa tất cả đã đọc</span>
                </button>
              )}
              
              {selectedIds.length > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedIds.length} đã chọn
                  </span>
                  <button
                    onClick={() => handleMarkAsRead(selectedIds)}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="Đánh dấu đã đọc"
                  >
                    <EyeOff size={16} />
                  </button>
                  <button
                    onClick={() => handleMarkAsUnread(selectedIds)}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="Đánh dấu chưa đọc"
                  >
                    <EyeOff size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedIds)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Filter size={16} />
                <span>Bộ lọc</span>
              </button>

              {/* Quick filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'read'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, status }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.status === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {status === 'all' ? 'Tất cả' : status === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {notificationTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                          className={`flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                            filters.type === type.value
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-white hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {priorityTypes.map(priority => (
                      <button
                        key={priority.value}
                        onClick={() => setFilters(prev => ({ ...prev, priority: priority.value }))}
                        className={`p-2 rounded-lg text-sm transition-colors ${
                          filters.priority === priority.value
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-600">
                {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'Không tìm thấy thông báo nào phù hợp với bộ lọc'
                  : 'Bạn chưa có thông báo nào'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const Icon = notificationTypes.find(t => t.value === notification.type)?.icon || Bell;
              const isSelected = selectedIds.includes(notification.id);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 lg:p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${selectedNotification?.id === notification.id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedIds(prev => 
                          isSelected 
                            ? prev.filter(id => id !== notification.id)
                            : [...prev, notification.id]
                        );
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'order' ? 'bg-blue-100' :
                        notification.type === 'payment' ? 'bg-green-100' :
                        notification.type === 'shop' ? 'bg-purple-100' :
                        notification.type === 'user' ? 'bg-orange-100' :
                        notification.type === 'system' ? 'bg-gray-100' :
                        notification.type === 'promotion' ? 'bg-yellow-100' :
                        notification.type === 'security' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Icon size={16} className={
                          notification.type === 'order' ? 'text-blue-600' :
                          notification.type === 'payment' ? 'text-green-600' :
                          notification.type === 'shop' ? 'text-purple-600' :
                          notification.type === 'user' ? 'text-orange-600' :
                          notification.type === 'system' ? 'text-gray-600' :
                          notification.type === 'promotion' ? 'text-yellow-600' :
                          notification.type === 'security' ? 'text-red-600' : 'text-gray-600'
                        } />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`text-sm lg:text-base font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        } line-clamp-1`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2">
                          {notification.priority === 'urgent' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(notification.id);
                            }}
                            className={`p-1 rounded hover:bg-gray-200 ${
                              notification.isStarred ? 'text-yellow-500' : 'text-gray-400'
                            }`}
                          >
                            <Star size={16} className={notification.isStarred ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {notificationTypes.find(t => t.value === notification.type)?.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatFullDate(notification.createdAt)}
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedNotification && (
        <div className="flex-1 bg-white lg:min-w-96 overflow-y-auto">
          <div className="p-4 lg:p-6 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết thông báo</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStar(selectedNotification.id)}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    selectedNotification.isStarred ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star size={20} className={selectedNotification.isStarred ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={() => handleDelete([selectedNotification.id])}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-lg ${
                    selectedNotification.type === 'order' ? 'bg-blue-100' :
                    selectedNotification.type === 'payment' ? 'bg-green-100' :
                    selectedNotification.type === 'shop' ? 'bg-purple-100' :
                    selectedNotification.type === 'user' ? 'bg-orange-100' :
                    selectedNotification.type === 'system' ? 'bg-gray-100' :
                    selectedNotification.type === 'promotion' ? 'bg-yellow-100' :
                    selectedNotification.type === 'security' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {React.createElement(
                      notificationTypes.find(t => t.value === selectedNotification.type)?.icon || Bell,
                      { 
                        size: 24, 
                        className: selectedNotification.type === 'order' ? 'text-blue-600' :
                          selectedNotification.type === 'payment' ? 'text-green-600' :
                          selectedNotification.type === 'shop' ? 'text-purple-600' :
                          selectedNotification.type === 'user' ? 'text-orange-600' :
                          selectedNotification.type === 'system' ? 'text-gray-600' :
                          selectedNotification.type === 'promotion' ? 'text-yellow-600' :
                          selectedNotification.type === 'security' ? 'text-red-600' : 'text-gray-600'
                      }
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedNotification.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getPriorityBadge(selectedNotification.priority)}
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {notificationTypes.find(t => t.value === selectedNotification.type)?.label}
                      </span>
                      <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-600">
                        Đã đọc
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      {formatFullDate(selectedNotification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Nội dung thông báo</h4>
                <p className="text-gray-800 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Related Data */}
              {selectedNotification.relatedData && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin liên quan</h4>
                  <div className="space-y-3">
                    {selectedNotification.relatedData.orderId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {selectedNotification.relatedData.orderId}
                        </span>
                      </div>
                    )}
                    {selectedNotification.relatedData.shopId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Mã shop:</span>
                        <span className="text-sm font-medium text-purple-600">
                          {selectedNotification.relatedData.shopId}
                        </span>
                      </div>
                    )}
                    {selectedNotification.relatedData.userId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Mã người dùng:</span>
                        <span className="text-sm font-medium text-orange-600">
                          {selectedNotification.relatedData.userId}
                        </span>
                      </div>
                    )}
                    {selectedNotification.relatedData.amount && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Số tiền:</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(selectedNotification.relatedData.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Hành động</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleMarkAsUnread([selectedNotification.id])}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <EyeOff size={16} />
                    <span>Đánh dấu chưa đọc</span>
                  </button>
                  
                  {/* Type-specific actions */}
                  {selectedNotification.type === 'order' && selectedNotification.relatedData?.orderId && (
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Package size={16} />
                      <span>Xem đơn hàng</span>
                    </button>
                  )}
                  
                  {selectedNotification.type === 'payment' && selectedNotification.relatedData?.amount && (
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CreditCard size={16} />
                      <span>Xem giao dịch</span>
                    </button>
                  )}
                  
                  {selectedNotification.type === 'shop' && selectedNotification.relatedData?.shopId && (
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Store size={16} />
                      <span>Xem shop</span>
                    </button>
                  )}
                  
                  {selectedNotification.type === 'user' && selectedNotification.relatedData?.userId && (
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      <User size={16} />
                      <span>Xem người dùng</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Info for Security Notifications */}
              {selectedNotification.type === 'security' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    Thông tin bảo mật18
                  </h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>• Thời gian phát hiện: {formatFullDate(selectedNotification.createdAt)}</p>
                    <p>• Mức độ rủi ro: Cao</p>
                    <p>• Khuyến nghị: Kiểm tra và thay đổi mật khẩu ngay lập tức</p>
                  </div>
                  <button className="mt-3 flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    <CheckCircle size={16} />
                    <span>Xử lý cảnh báo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;