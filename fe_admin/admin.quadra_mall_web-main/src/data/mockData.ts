// src/data/mockData.ts

import type { Category, PendingShop } from "@/types/category";
import type { Notification_ } from "@/types/common";
import type { RevenueData, ShopStatusData } from "@/types/dashboard";
import type { Shop } from "@/types/shop";

export const revenueData: RevenueData[] = [
  { month: 'T1', revenue: 45000000, shops: 120, users: 8500 },
  { month: 'T2', revenue: 52000000, shops: 135, users: 9200 },
  { month: 'T3', revenue: 48000000, shops: 142, users: 9800 },
  { month: 'T4', revenue: 61000000, shops: 158, users: 10500 },
  { month: 'T5', revenue: 68000000, shops: 167, users: 11200 },
  { month: 'T6', revenue: 72000000, shops: 175, users: 12000 },
];

export const shopStatusData: ShopStatusData[] = [
  { name: 'Hoạt động', value: 175, color: '#10b981' },
  { name: 'Chờ duyệt', value: 45, color: '#f59e0b' },
  { name: 'Tạm khóa', value: 12, color: '#ef4444' },
];

export const mockCategories: Category[] = [
  { 
    id: 1, 
    name: 'Thời trang', 
    level: 0, 
    children: [
      { id: 2, name: 'Thời trang nam', level: 1, children: [
        { id: 3, name: 'Áo sơ mi', level: 2, children: [] },
        { id: 4, name: 'Quần jean', level: 2, children: [] },
      ]},
      { id: 5, name: 'Thời trang nữ', level: 1, children: [
        { id: 6, name: 'Đầm/Váy', level: 2, children: [] },
        { id: 7, name: 'Áo kiểu', level: 2, children: [] },
      ]},
    ]
  },
  { 
    id: 8, 
    name: 'Điện tử', 
    level: 0, 
    children: [
      { id: 9, name: 'Điện thoại', level: 1, children: [] },
      { id: 10, name: 'Laptop', level: 1, children: [] },
    ]
  },
];

export const mockPendingShops: PendingShop[] = [
  {
    id: 1,
    shopName: 'Thời trang ABC',
    ownerName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0987654321',
    taxId: '123456789012',
    idCardNumber: '123456789012',
    idCardFront: 'cccd-front-1.jpg',
    idCardBack: 'cccd-back-1.jpg',
    registeredAt: '2024-06-15',
    status: 'pending',
  },
  {
    id: 5,
    shopName: 'Sách ABC',
    ownerName: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    phone: '0934567890',
    taxId: '567890123456',
    idCardNumber: '567890123456',
    idCardFront: 'cccd-front-5.jpg',
    idCardBack: 'cccd-back-5.jpg',
    registeredAt: '2024-06-12',
    status: 'approved',
    isLocked: true,
  },
  {
    id: 2,
    shopName: 'Điện tử XYZ',
    ownerName: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0907654321',
    taxId: '987654321098',
    idCardNumber: '987654321098',
    idCardFront: 'cccd-front-2.jpg',
    idCardBack: 'cccd-back-2.jpg',
    registeredAt: '2024-06-16',
    status: 'pending',
  },
  {
    id: 3,
    shopName: 'Mỹ phẩm DEF',
    ownerName: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0912345678',
    taxId: '456789123456',
    idCardNumber: '456789123456',
    idCardFront: 'cccd-front-3.jpg',
    idCardBack: 'cccd-back-3.jpg',
    registeredAt: '2024-06-14',
    status: 'approved',
    isLocked: false,
  },
  {
    id: 4,
    shopName: 'Phụ kiện GHI',
    ownerName: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0923456789',
    taxId: '789123456789',
    idCardNumber: '789123456789',
    idCardFront: 'cccd-front-4.jpg',
    idCardBack: 'cccd-back-4.jpg',
    registeredAt: '2024-06-13',
    status: 'rejected',
  },
];

export const mockShops: Shop[] = [
  {
    id: 1,
    shopName: 'Thời trang ABC',
    ownerName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0987654321',
    taxId: '123456789012',
    idCardNumber: '123456789012',
    idCardFront: 'cccd-front-1.jpg',
    idCardBack: 'cccd-back-1.jpg',
    registeredAt: '2024-06-15',
    status: 'active',
    isLocked: false,
    commissionFee: 50, // Phí hoa hồng (triệu)
    serviceFee: 20, // Phí dịch vụ (triệu)
    totalRevenue: 70, // Tổng (triệu)
    favoriteCount: 1200,
    rating: 4.8,
    tier: 'gold',
    orderCount: 500,
    completionRate: 95,
    violationReports: [
      {
        id: 1,
        reporterName: 'Khách hàng X',
        reason: 'Bán hàng giả',
        evidence: 'evidence-1.jpg',
        reportedAt: '2025-06-10',
        status: 'pending',
      },
    ],
    products: [
      { id: 1, name: 'Áo thun', price: 200000, status: 'active' },
      { id: 2, name: 'Quần jeans', price: 500000, status: 'pending' },
    ],
  },
  {
    id: 2,
    shopName: 'Điện tử XYZ',
    ownerName: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0907654321',
    taxId: '987654321098',
    idCardNumber: '987654321098',
    idCardFront: 'cccd-front-2.jpg',
    idCardBack: 'cccd-back-2.jpg',
    registeredAt: '2024-06-16',
    status: 'locked',
    isLocked: true,
    commissionFee: 30,
    serviceFee: 15,
    totalRevenue: 45,
    favoriteCount: 800,
    rating: 4.2,
    tier: 'silver',
    orderCount: 300,
    completionRate: 85,
    violationReports: [],
    products: [
      { id: 3, name: 'Tai nghe', price: 1000000, status: 'active' },
    ],
  },
  {
    id: 3,
    shopName: 'Mỹ phẩm DEF',
    ownerName: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0912345678',
    taxId: '456789123456',
    idCardNumber: '456789123456',
    idCardFront: 'cccd-front-3.jpg',
    idCardBack: 'cccd-back-3.jpg',
    registeredAt: '2024-06-14',
    status: 'active',
    isLocked: false,
    commissionFee: 80,
    serviceFee: 25,
    totalRevenue: 105,
    favoriteCount: 2000,
    rating: 4.9,
    tier: 'gold',
    orderCount: 700,
    completionRate: 98,
    violationReports: [],
    products: [
      { id: 4, name: 'Son môi', price: 300000, status: 'active' },
      { id: 5, name: 'Kem dưỡng', price: 600000, status: 'rejected' },
    ],
  },
  {
    id: 4,
    shopName: 'Phụ kiện GHI',
    ownerName: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0923456789',
    taxId: '789123456789',
    idCardNumber: '789123456789',
    idCardFront: 'cccd-front-4.jpg',
    idCardBack: 'cccd-back-4.jpg',
    registeredAt: '2024-06-13',
    status: 'reported',
    isLocked: false,
    commissionFee: 40,
    serviceFee: 10,
    totalRevenue: 50,
    favoriteCount: 1000,
    rating: 4.5,
    tier: 'bronze',
    orderCount: 400,
    completionRate: 90,
    violationReports: [
      {
        id: 2,
        reporterName: 'Khách hàng Y',
        reason: 'Giao hàng chậm',
        evidence: 'evidence-2.jpg',
        reportedAt: '2025-06-12',
        status: 'resolved',
        response: 'Đã nhắc nhở shop cải thiện dịch vụ.',
        adminNote: 'Cảnh cáo lần 1',
      },
    ],
    products: [
      { id: 6, name: 'Vòng cổ', price: 150000, status: 'active' },
    ],
  },
];

export const mockNotifications: Notification_[] = [
  { id: 1, title: 'Đơn hàng mới', message: 'Shop ABC có đơn hàng mới cần xử lý', time: '2 phút trước', unread: true },
  { id: 2, title: 'Yêu cầu mở shop', message: 'Người dùng XYZ yêu cầu mở shop mới', time: '15 phút trước', unread: true },
  { id: 3, title: 'Báo cáo vi phạm', message: 'Shop DEF bị báo cáo vi phạm', time: '1 giờ trước', unread: false },
];