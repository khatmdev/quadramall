export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  children: CategoryDto[];
  isExpanded?: boolean;
}

export interface DiscountCodeDto {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountValue: number;
  startDate: [number, number, number]; // [year, month, day]
  endDate: [number, number, number]; // [year, month, day]
  isActive: boolean;
  quantity: number;
  maxUses: number;
  usedCount: number;
  saved: boolean;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  slug: string;
  thumbnailUrl: string;
  rating: number;
  soldCount: number;
  isFav: boolean;
}

export interface ShopDetailDto {
  storeId: number;
  storeName: string;
  storeSlug: string;
  address: string;
  description: string;
  logoUrl: string;
  status: string;
  productCount: number;
  followerCount: number;
  reviewCount: number;
  averageRating: number;
  favorite: boolean;
  joinDate:  [number, number, number];
  chatResponseRate: number;
  categories: CategoryDto[];
  products: ProductDto[];
  discountCodes: DiscountCodeDto[];
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface StoreFavoriteRequestDto {
  storeId: number;
  isFavorite: boolean;
}
