// src/types/Notification/notification.ts
export interface Notification {
  id: number;
  userId: number;
  type: 'ORDER_UPDATE' | 'PROMOTION' | 'PAYMENT_SUCCESS' | 'TRANSFER' | 'MESSAGE';
  title: string;
  message: string;
  referenceId?: number;
  isRead: boolean; // Sử dụng isRead làm trường chính
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  category: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'PAYMENT' | 'MESSAGE';
  icon?: string;
  read?: boolean; // Thêm read để ánh xạ từ backend
}