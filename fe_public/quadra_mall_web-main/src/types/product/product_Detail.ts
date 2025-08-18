export interface ProductDetailDTO {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  storeId: number | null;
  categoryId: number | null;
  availableAttributes: AttributeDTO[] | null;
  variants: VariantDTO[] | null;
  variantDetails: VariantAttributeDTO[] | null;
  addonGroups: AddonGroupDTO[] | null;
  images: ProductImageDTO[] | null;
  store: StoreDTO | null;
  discountCodes: DiscountCodeDTO[] | null;
  specifications: SpecificationDTO[] | null;
  soldCount: number | null;
  averageRating: number | null;
  reviewCount: number | null;
  reviews: ReviewDTO[] | null;
  minPrice: number | null; // Thêm minPrice
  maxPrice: number | null; // Thêm maxPrice
  totalStockQuantity: number | null; // Thêm totalStockQuantity - tổng số lượng tồn kho
  flashSaleEndTime: string | null; // Thêm flashSaleEndTime
  flashSale: FlashSaleDTO | null; // Thêm flashSale
  samePrice: boolean;
}

export interface FlashSaleDTO {
  percentageDiscount: number;
  remainingQuantity: number;
  startTime: string;
  endTime: string;
}

export interface ReviewDTO {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  userName: string | null;
  avatarUrl: string | null;
  likes: number | null;
}

export interface AttributeDTO {
  name: string;
  values: string[] | null;
}

export interface VariantDTO {
  id: number;
  sku: string;
  price: number; // Giá gốc
  discountedPrice: number | null; // Giá sau giảm (flash sale)
  stockQuantity: number;
  imageUrl: string | null;
  altText: string | null;
}

export interface VariantAttributeDTO {
  variantId: number;
  attributeName: string;
  attributeValue: string;
}

export interface AddonGroupDTO {
  id: number;
  name: string;
  maxChoice: number;
  addons: AddonDTO[] | null;
}

export interface AddonDTO {
  id: number;
  name: string;
  priceAdjust: number;
}

export interface ProductImageDTO {
  productId: number;
  imageUrl: string;
  altText: string | null;
  isThumbnail: boolean;
}

export interface StoreDTO {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  description: string | null;
  logoUrl: string | null;
  rating: number | null;
  productCount: number | null;
  reviewCount: number | null;
  favorite: boolean;
}

export interface DiscountCodeDTO {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
}

export interface SpecificationDTO {
  name: string;
  value: string;
}

export interface StoreFavoriteRequestDto {
  storeId: number;
  isFavorite: boolean;
}
