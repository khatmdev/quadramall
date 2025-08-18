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
  id: number;
  customer_id: number;
  store_id: number;
  status: 'pending' | 'completed' | 'cancelled';
  shipping_method: string;
  payment_method: string;
  discount_code?: string;
  total_amount: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  gateway_name: string;
  method: string;
  type: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency_code: string;
  transaction_code?: string;
  gateway_response?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  account_number: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  type: 'top-up' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  created_at: string;
  updated_at: string;
  reference_id?: number;
  transfer_id?: number;
}

export interface BankTransactionLog {
  id: number;
  wallet_transaction_id?: number;
  bank_account_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  type: 'top-up' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  description?: string;
  source: 'wallet' | 'bank' | 'order';
  orderId?: number;
  walletId?: number;
  bankAccountId?: number;
  transactionCode?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}