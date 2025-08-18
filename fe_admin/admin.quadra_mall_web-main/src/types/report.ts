export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'pending' | 'inactive';
  stock: number;
  sold: number;
}

export interface ViolationReport {
  id: number;
  reporterName: string;
  reason: string;
  description?: string;
  evidence?: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  severity: 'high' | 'medium' | 'low';
  response?: string;
  adminNote?: string;
}

export interface Shop {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  idCardNumber: string;
  address: string;
  avatar: string;
  status: 'active' | 'suspended' | 'pending_verification';
  isLocked: boolean;
  lockReason?: string;
  rating: number;
  reviewCount: number;
  orderCount: number;
  completionRate: number;
  responseRate: number;
  totalRevenue: number;
  commissionFee: number;
  serviceFee: number;
  favoriteCount: number;
  followersCount: number;
  joinedDate: string;
  lastActiveDate: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  products: Product[];
  violationReports: ViolationReport[];
}

export interface Order {
  id: string;
  shopId: number;
  totalAmount: number;
  commission: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}