interface ItemType {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface Product {
  id: number;
  itemType: ItemType;
  category: Category;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  isActive: boolean;
}

interface Store {
  id: number;
  name: string;
  image?: string;
}

interface ProductVariant {
  id: number;
  product: Product;
  store: Store;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string;
  altText: string;
}

interface Addon {
  addonGroupName: string;
  addonName: string;
  priceAdjust: number;
}

interface OrderItem {
  id: number;
  productVariant: ProductVariant;
  quantity: number;
  priceAtTime: number;
  createdAt: number[];
  updatedAt: number[];
  addons: Addon[];
  totalItemPrice: number;
}

// Voucher từ API backend - Updated với đầy đủ fields
interface DiscountCodeDTO {
  id: number;
  storeId: number;
  storeName?: string;
  quantity: number;
  maxUses: number;
  usedCount: number;
  usagePerCustomer: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountValue?: number;
  startDate: string;
  endDate: string;
  appliesTo: 'SHOP' | 'PRODUCTS';
  autoApply: boolean;
  priority: number;
  createdBy: number;
  createdByName?: string;
  productIds?: number[]; // Danh sách tất cả product IDs mà voucher có thể áp dụng
  productNames?: string[]; // Tên các sản phẩm
  applicableProductIds?: number[]; // Product IDs trong order được áp dụng voucher
  isActive: boolean;
  createdAt: string | number[];
  updatedAt: string | number[];
}

interface Order {
  id: number;
  store: Store;
  status: string;
  shippingMethod: string;
  paymentMethod: string;
  totalAmount: number;
  note: string;
  createdAt: number[];
  updatedAt: number[];
  orderItemResponses: OrderItem[];
  shippingCost: number;
  availableVouchers?: DiscountCodeDTO[];
  appliedVoucher?: DiscountCodeDTO;
  discountAmount?: number;
  originalAmount?: number;
}

interface Address {
  id?: number;
  receiverName: string;
  receiverPhone: string;
  detailAddress: string;
  ward: string;
  district: string;
  city: string;
  wardCode: string;
  districtCode: string;
  cityCode: string;
  isDefault: boolean;
}

interface CheckoutData {
  addressDefault?: Address;
  orderResponse: Order[];
}

interface LocationItem {
  code: string | number;
  name: string;
}

export type { 
  ItemType, 
  Category,
  Product, 
  Store, 
  ProductVariant, 
  Addon, 
  OrderItem, 
  Order, 
  Address, 
  CheckoutData, 
  DiscountCodeDTO, 
  LocationItem 
};