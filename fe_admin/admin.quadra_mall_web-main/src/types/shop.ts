interface Product {
  id: number;
  name: string;
  minPrice: number;
  maxPrice: number;
  status: 'active' | 'pending' | 'rejected';
  stock: number;
  sold: number;
}

interface ViolationReport {
  id: number;
  reporterName: string;
  reason: string;
  description: string;
  evidence: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  response?: string;
  adminNote?: string;
  severity: 'low' | 'medium' | 'high';
}

interface Shop {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  idCardNumber: string;
  address: string;
  avatar: string;
  status: 'active' | 'inactive' | 'locked' | 'reported';
  lockReason: string  | undefined;
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
  products: Product[];
  violationReports: ViolationReport[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

export type { Product, ViolationReport, Shop };