// src/components/notification/NotificationsPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { AppDispatch, RootState } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotifications } from '@/store/Notification/notificationSlice';
import { Notification } from '@/types/Notification/notification';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { notifications, unreadCount, loading, error, page, hasMore } = useSelector(
    (state: RootState) => state.notifications
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { sendReadReceipt } = useWebSocket();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications({ page: 1 }));
    }
  }, [dispatch, user, location.pathname]);

  useEffect(() => {
    if (inView && hasMore && !loading && user) {
      dispatch(fetchNotifications({ page }));
    }
  }, [inView, dispatch, user?.id, page, loading, hasMore]);

  const filterOptions = [
    { value: 'all', label: 'Tất cả', count: notifications.length },
    { value: 'unread', label: 'Chưa đọc', count: unreadCount },
    { value: 'ORDER_UPDATE', label: 'Đơn hàng', count: notifications.filter((n: Notification) => n.type === 'ORDER_UPDATE').length },
    { value: 'PROMOTION', label: 'Khuyến mãi', count: notifications.filter((n: Notification) => n.type === 'PROMOTION').length },
    { value: 'PAYMENT_SUCCESS', label: 'Thanh toán', count: notifications.filter((n: Notification) => n.type === 'PAYMENT_SUCCESS').length },
    { value: 'TRANSFER', label: 'Chuyển khoản', count: notifications.filter((n: Notification) => n.type === 'TRANSFER').length },
    { value: 'MESSAGE', label: 'Tin nhắn', count: notifications.filter((n: Notification) => n.type === 'MESSAGE').length },
  ];

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    return notification.type === selectedFilter;
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'ORDER_UPDATE': return 'bg-blue-50';
      case 'PROMOTION': return 'bg-yellow-50';
      case 'PAYMENT_SUCCESS': return 'bg-green-50';
      case 'TRANSFER': return 'bg-purple-50';
      case 'MESSAGE': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-yellow-400';
      case 'low': return 'border-l-green-400';
      default: return 'border-l-gray-400';
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n: Notification) => n.id));
    }
  };

  const handleMarkAsRead = () => {
    selectedNotifications.forEach((id) => {
      sendReadReceipt(id);
      dispatch(markNotificationAsRead(id));
    });
    setSelectedNotifications([]);
    if (user) {
      dispatch(fetchNotifications({ page: 1 }));
    }
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      dispatch(markAllNotificationsAsRead());
      setSelectedNotifications([]);
    }
  };

  const handleDelete = () => {
    if (selectedNotifications.length > 0) {
      dispatch(deleteNotifications(selectedNotifications));
      setSelectedNotifications([]);
      if (user) {
        dispatch(fetchNotifications({ page: 1 }));
      }
    }
  };

  if (loading && page === 1) {
    return <div className="text-center py-12">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý tất cả thông báo của bạn</p>
            </div>
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAsRead}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Đánh dấu đã đọc ({selectedNotifications.length})
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa ({selectedNotifications.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">Bộ lọc</h3>
              </div>
              <div className="p-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedFilter === option.value
                            ? 'bg-blue-200 text-blue-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {option.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Chọn tất cả ({filteredNotifications.length})
                    </span>
                  </label>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredNotifications.map((notification: Notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${getNotificationBgColor(notification.type, notification.isRead)} border border-gray-200 rounded-lg hover:shadow-sm transition-shadow border-l-4 ${getPriorityColor(
                    notification.priority
                  )}`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <div className="text-2xl">{notification.icon || '🔔'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={`text-sm font-medium ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}
                            >
                              {notification.title}
                              {!notification.isRead && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  notification.priority === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : notification.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {notification.priority === 'high'
                                  ? 'Quan trọng'
                                  : notification.priority === 'medium'
                                  ? 'Bình thường'
                                  : 'Thấp'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => {
                                  sendReadReceipt(notification.id);
                                  dispatch(markNotificationAsRead(notification.id));
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                dispatch(deleteNotifications([notification.id]));
                                if (user) {
                                  dispatch(fetchNotifications({ page: 1 }));
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {hasMore && (
                <div ref={ref} className="text-center py-4">
                  <p className="text-gray-500">Đang tải thêm...</p>
                </div>
              )}
            </motion.div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                <p className="text-gray-500">
                  {selectedFilter === 'unread'
                    ? 'Bạn đã đọc hết tất cả thông báo!'
                    : 'Chưa có thông báo nào trong danh mục này.'}
                </p>
              </div>
            )}

            {filteredNotifications.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">Hiển thị {filteredNotifications.length} thông báo</p>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={page === 1}
                    onClick={() => dispatch(fetchNotifications({ page: page - 1 }))}
                  >
                    Trước
                  </button>
                  <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">{page - 1}</span>
                  <button
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!hasMore}
                    onClick={() => dispatch(fetchNotifications({ page }))}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;