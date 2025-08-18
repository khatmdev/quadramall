// src/components/notification/NotificationDropdown.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/store/Notification/notificationSlice';
import { Notification } from '@/types/Notification/notification';

interface NotificationDropdownProps {
  show: boolean;
  toggleNotifications: () => void;
  closeAllDropdowns: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  show,
  toggleNotifications,
  closeAllDropdowns,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);
  const { sendReadReceipt } = useWebSocket();

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'ORDER_UPDATE': return 'bg-blue-50';
      case 'PROMOTION': return 'bg-yellow-50';
      case 'PAYMENT_SUCCESS': return 'bg-green-50';
      case 'TRANSFER': return 'bg-purple-50';
      case 'MESSAGE': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const handleMarkAllRead = () => {
    if (user) {
      dispatch(markAllNotificationsAsRead());
      closeAllDropdowns();
    }
  };

  return (
    <div className="relative">
      <button
        className="text-white/90 hover:text-gray-800 relative"
        aria-label="Notifications"
        onClick={toggleNotifications}
      >
        <svg className="w-5 h-5 mt-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Thông báo</h3>
              <span
                className="text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={handleMarkAllRead}
              >
                Đánh dấu tất cả đã đọc
              </span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Không có thông báo mới</p>
            ) : (
              notifications.map((notification: Notification) => (
                <Link
                  key={notification.id}
                  to={`/notifications/${notification.id}`}
                  className={`block p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${getNotificationBgColor(
                    notification.type,
                    notification.isRead
                  )}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      sendReadReceipt(notification.id);
                      dispatch(markNotificationAsRead(notification.id));
                      dispatch(fetchNotifications({ page: 1 }));
                    }
                    closeAllDropdowns();
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{notification.icon || '🔔'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p
                          className={`text-xs font-medium ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-800'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100">
            <Link
              to="/notifications"
              className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
              onClick={closeAllDropdowns}
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(NotificationDropdown);