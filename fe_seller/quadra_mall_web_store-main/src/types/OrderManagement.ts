// @/types/OrderManagement.ts

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED_PREPARING = 'CONFIRMED_PREPARING',
  ASSIGNED_TO_SHIPPER = 'ASSIGNED_TO_SHIPPER',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE',
  WALLET = 'WALLET'
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS'
}

export interface Store {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  confirmedPreparingOrders: number;
  assignedToShipperOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
}

export interface OrderFilterRequest {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  orderId?: string;
}

export interface OrderSummary {
  id: number;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
  canUpdateStatus: boolean;
  nextStatus?: string;
  // Add store info to order summary
  storeName?: string;
  storeId?: number;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CustomerInfo {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

export interface OrderShippingInfo {
  pickupAddress: string;
  pickupWard: string;
  pickupDistrict: string;
  pickupProvince: string;
  deliveryAddress: string;
  deliveryWard: string;
  deliveryDistrict: string;
  deliveryProvince: string;
  deliveryName: string;
  shippingCost: number;
}

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  variantName: string;
  sku: string;
  quantity: number;
  priceAtTime: number;
  totalPrice: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  statusDisplayName: string;
  description: string;
  timestamp: string;
  note?: string;
}

export interface OrderDetail {
  id: number;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  shipping: OrderShippingInfo;
  items: OrderItemDetail[];
  canUpdateStatus: boolean;
  availableStatuses: OrderStatus[];
  timeline: OrderTimeline[];
  // Add store info to order detail
  storeName?: string;
  storeId?: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
  orderIds?: number[];
}

export interface OrderManagementState {

  // Stats
  stats: OrderStats | null;
  statsLoading: boolean;
  
  // Order List
  orders: OrderSummary[];
  orderListLoading: boolean;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  
  // Filters
  filters: OrderFilterRequest;
  
  // Order Detail
  selectedOrder: OrderDetail | null;
  orderDetailLoading: boolean;
  
  // Selected orders for batch operations
  selectedOrderIds: number[];
  
  // UI state
  error: string | null;
  updating: boolean;
}

// Status display mappings
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.CONFIRMED_PREPARING]: 'Đã xác nhận - Chuẩn bị hàng',
  [OrderStatus.ASSIGNED_TO_SHIPPER]: 'Đã giao shipper',
  [OrderStatus.PICKED_UP]: 'Đã lấy hàng',
  [OrderStatus.IN_TRANSIT]: 'Đang vận chuyển',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.RETURNED]: 'Đã trả lại'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.CONFIRMED_PREPARING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.ASSIGNED_TO_SHIPPER]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.PICKED_UP]: 'bg-cyan-100 text-cyan-800',
  [OrderStatus.IN_TRANSIT]: 'bg-orange-100 text-orange-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CONFIRMED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.RETURNED]: 'bg-gray-100 text-gray-800'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'Thanh toán khi nhận hàng',
  [PaymentMethod.ONLINE]: 'Thanh toán online',
  [PaymentMethod.WALLET]: 'Ví điện tử'
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  [ShippingMethod.STANDARD]: 'Tiêu chuẩn',
  [ShippingMethod.EXPRESS]: 'Nhanh'
};