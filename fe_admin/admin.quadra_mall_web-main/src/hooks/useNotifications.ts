import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: 'Đơn hàng mới', 
      message: 'Shop ABC có đơn hàng mới cần xử lý', 
      time: '2 phút trước', 
      unread: true,
      type: 'info'
    },
    { 
      id: 2, 
      title: 'Yêu cầu mở shop', 
      message: 'Người dùng XYZ yêu cầu mở shop mới', 
      time: '15 phút trước', 
      unread: true,
      type: 'warning'
    },
    { 
      id: 3, 
      title: 'Báo cáo vi phạm', 
      message: 'Shop DEF bị báo cáo vi phạm', 
      time: '1 giờ trước', 
      unread: false,
      type: 'error'
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleOpen = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  // Auto close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.notification-dropdown')) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return {
    notifications,
    isOpen,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    toggleOpen,
    close,
  };
};
