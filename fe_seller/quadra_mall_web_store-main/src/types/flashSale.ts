export interface SellerFlashSaleProductDTO {
  id: number;
  productId: number;
  productName: string;
  minPrice: string; // Use string for BigDecimal to preserve precision
  maxPrice: string; // Use string for BigDecimal to preserve precision
  percentageDiscount: number;
  stock: number;
  quantity: number;
  startTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
  endTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
}

export interface CreateFlashSaleDTO {
  productId: number;
  percentageDiscount: number;
  quantity: number;
  startTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
  endTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
}

export interface UpdateFlashSaleDTO {
  percentageDiscount: number;
  quantity: number;
  startTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
  endTime: string; // ISO date-time string (e.g., 'yyyy-MM-ddTHH:mm:ss')
}

export interface ProductSellerDTO {
  id: number;
  name: string;
  minPrice: string; // Use string for BigDecimal to preserve precision
  maxPrice: string; // Use string for BigDecimal to preserve precision
  stock: number;
  percentageDiscount?: number; // Optional, as it may not always be set based on BE mapping
}
