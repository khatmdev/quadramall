import { api } from '@/main';

// Interfaces based on backend response
export interface OrderProductResponse {
  id: number;
  name: string;
  thumbnailUrl: string;
  description: string;
  slug: string;
  isActive: boolean;
}

export interface OrderStoreResponse {
  id: number;
  name: string;
  image: string;
}

export interface OrderProductVariantResponse {
  id: number;
  sku: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  product: OrderProductResponse;
  store: OrderStoreResponse;
}

export interface OrderItemAddonResponse {
  addonName: string;
  addonGroupName: string;
  priceAdjust: number;
}

export interface OrderItemResponse {
  id: number;
  quantity: number;
  priceAtTime: number;
  totalItemPrice: number;
  productVariant: OrderProductVariantResponse;
  addons: OrderItemAddonResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: number;
  status: string;
  shippingMethod: string;
  paymentMethod: string;
  totalAmount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  store?: OrderStoreResponse;
  orderItemResponses?: OrderItemResponse[];
  shippingCost?: number;
}

// API functions
export const getAllOrders = async (): Promise<OrderResponse[]> => {
  const response = await api.get('/order/user');
  return response.data.data;
};

export const getOrdersByStatus = async (status: string): Promise<OrderResponse[]> => {
  const response = await api.get('/order/user/status', {
    params: { status }
  });
  return response.data.data;
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  await api.put(`/order/cancel/${orderId}`);
};
