export interface OrderItem {
  id: number;
  productName: string;
  variantName?: string; // Optional vì có thể không có variant
  quantity: number;
  price: number;
  imageUrl?: string; // Optional vì có thể không có ảnh
}

export interface ShipperOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string; // Địa chỉ giao hàng chính
  totalAmount: number;
  status: OrderStatus;
  assignmentStatus: DeliveryStatus;
  items: OrderItem[];
  
  // Pickup information
  pickupAddress: string;
  pickupProvince?: string; // Thêm thông tin chi tiết pickup
  pickupDistrict?: string;
  pickupWard?: string;
  
  // Delivery information  
  deliveryAddress: string;
  deliveryProvince?: string; // Thêm thông tin chi tiết delivery
  deliveryDistrict?: string;
  deliveryWard?: string;
  
  // Timing
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedDelivery: string;
  estimatedPickup?: string; // Thêm thời gian dự kiến lấy hàng
  
  // Additional info
  notes?: string;
  deliveryNotes?: string; // Ghi chú riêng cho giao hàng
  shippingCost?: number; // Chi phí ship
  distanceKm?: number; // Khoảng cách
  storeName?: string; // Tên cửa hàng
  
  // Tracking
  createdAt: string;
  updatedAt?: string;
  
  // Cancellation info (if cancelled)
  cancellationReason?: string;
  cancelledAt?: string;
  
  // Completion info
  confirmationCode?: string; // Mã xác nhận từ khách hàng
  completedAt?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ASSIGNED_TO_SHIPPER = 'ASSIGNED_TO_SHIPPER',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED' // Thêm trạng thái trả hàng
}

export enum DeliveryStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED' // Thêm trạng thái trả hàng
}

export const ORDER_STATUS_LABELS = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.ASSIGNED_TO_SHIPPER]: 'Đã giao cho shipper',
  [OrderStatus.PICKED_UP]: 'Đã lấy hàng',
  [OrderStatus.IN_TRANSIT]: 'Đang vận chuyển',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.RETURNED]: 'Đã trả hàng'
};

export const DELIVERY_STATUS_LABELS = {
  [DeliveryStatus.AVAILABLE]: 'Có thể nhận',
  [DeliveryStatus.ASSIGNED]: 'Đã nhận',
  [DeliveryStatus.PICKED_UP]: 'Đã lấy hàng',
  [DeliveryStatus.IN_TRANSIT]: 'Đang vận chuyển',
  [DeliveryStatus.DELIVERED]: 'Đã giao hàng',
  [DeliveryStatus.CONFIRMED]: 'Đã xác nhận',
  [DeliveryStatus.CANCELLED]: 'Đã hủy',
  [DeliveryStatus.RETURNED]: 'Đã trả hàng'
};

// Thêm type helpers
export type ActiveDeliveryStatus = 
  | DeliveryStatus.ASSIGNED 
  | DeliveryStatus.PICKED_UP 
  | DeliveryStatus.IN_TRANSIT;

export type CompletedDeliveryStatus = 
  | DeliveryStatus.DELIVERED 
  | DeliveryStatus.CONFIRMED;

export type FailedDeliveryStatus = 
  | DeliveryStatus.CANCELLED 
  | DeliveryStatus.RETURNED;

// Utility functions
export const isActiveOrder = (status: DeliveryStatus): boolean => {
  return [
    DeliveryStatus.ASSIGNED,
    DeliveryStatus.PICKED_UP,
    DeliveryStatus.IN_TRANSIT
  ].includes(status);
};

export const isCompletedOrder = (status: DeliveryStatus): boolean => {
  return [
    DeliveryStatus.DELIVERED,
    DeliveryStatus.CONFIRMED
  ].includes(status);
};

export const isFailedOrder = (status: DeliveryStatus): boolean => {
  return [
    DeliveryStatus.CANCELLED,
    DeliveryStatus.RETURNED
  ].includes(status);
};

export const canPickupOrder = (status: DeliveryStatus): boolean => {
  return status === DeliveryStatus.ASSIGNED;
};

export const canStartDelivery = (status: DeliveryStatus): boolean => {
  return status === DeliveryStatus.PICKED_UP;
};

export const canCompleteOrder = (status: DeliveryStatus): boolean => {
  return status === DeliveryStatus.IN_TRANSIT;
};

export const canCancelOrder = (status: DeliveryStatus): boolean => {
  return [
    DeliveryStatus.ASSIGNED,
    DeliveryStatus.PICKED_UP,
    DeliveryStatus.IN_TRANSIT
  ].includes(status);
};

// Status color mapping cho UI
export const getStatusColor = (status: DeliveryStatus): string => {
  switch (status) {
    case DeliveryStatus.AVAILABLE:
      return 'bg-gray-100 text-gray-800';
    case DeliveryStatus.ASSIGNED:
      return 'bg-blue-100 text-blue-800';
    case DeliveryStatus.PICKED_UP:
      return 'bg-yellow-100 text-yellow-800';
    case DeliveryStatus.IN_TRANSIT:
      return 'bg-purple-100 text-purple-800';
    case DeliveryStatus.DELIVERED:
      return 'bg-green-100 text-green-800';
    case DeliveryStatus.CONFIRMED:
      return 'bg-emerald-100 text-emerald-800';
    case DeliveryStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    case DeliveryStatus.RETURNED:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Priority mapping for sorting
export const getStatusPriority = (status: DeliveryStatus): number => {
  switch (status) {
    case DeliveryStatus.ASSIGNED: return 1;
    case DeliveryStatus.PICKED_UP: return 2;
    case DeliveryStatus.IN_TRANSIT: return 3;
    case DeliveryStatus.DELIVERED: return 4;
    case DeliveryStatus.CONFIRMED: return 5;
    case DeliveryStatus.CANCELLED: return 6;
    case DeliveryStatus.RETURNED: return 7;
    case DeliveryStatus.AVAILABLE: return 8;
    default: return 9;
  }
};