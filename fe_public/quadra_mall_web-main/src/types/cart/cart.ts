export interface CartStoreDTO {
  store: StoreDTO;
  items: CartItemDTO[];
}

export interface StoreDTO {
  id: number;
  name: string;
  image: string;
}

export interface CartItemDTO {
  id: number;
  productId: number;
  slug: string;
  productName: string;
  variantId: number;
  variantAttributeNames: string;
  variantAttributes: VariantAttributeDTO[];
  allVariantAttributes: VariantAttributeDTO[];
  availableAttributes: AttributeDTO[];
  variants: VariantDTO[];
  quantity: number;
  addons: CartAddonDTO[];
  price: number;              // Giá gốc của variant
  totalPrice: number;         // Tổng giá đã tính flash sale + addon × quantity
  image: string;
  inStock: boolean;
  isActive: boolean;
  flashSale?: FlashSaleDTO;   // ✅ THÊM MỚI: Thông tin flash sale (optional)
}

export interface CartAddonDTO {
  addonId: number;
  addonName: string;
  priceAdjust: number;
}

export interface VariantAttributeDTO {
  variantId: number;
  attributeName: string;
  attributeValue: string;
}

export interface AttributeDTO {
  name: string;
  values: string[];
}

export interface VariantDTO {
  id: number;
  sku: string;
}

export interface UpdateCartItemVariantRequest {
  variantId: number;
  addonIds: number[];
}

// ✅ THÊM MỚI: FlashSale interface
export interface FlashSaleDTO {
  id: number;
  percentageDiscount: number;
  endTime: string;            // ISO string format để frontend parse thành Date
  soldCount: number;
  quantity: number;
}
