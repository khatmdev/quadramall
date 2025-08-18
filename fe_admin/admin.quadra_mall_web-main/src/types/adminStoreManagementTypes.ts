export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T | null;
    errorCode: string | null;
    timestamp: number;
}

export interface StoreManagementResponseDto {
    store: StoreDto | null;
    products: ProductDto[];
    stats: ProductStatsDto;
}

export interface StoreDto {
    storeId: number;
    storeName: string;
    storeAddress: string | null;
    storeDescription: string | null;
    storeLogoUrl: string | null;
    storeStatus: string;
    lockReason: string | null;
    storeCreatedAt: string;
    owner: OwnerDto | null;
}

export interface OwnerDto {
    ownerId: number;
    fullName: string;
    email: string;
    phone: string | null;
}

export interface ProductDto {
    productId: number;
    name: string;
    minPrice: number;
    maxPrice: number;
    totalStock: number;
    isActive: boolean;
    totalSold: number;
}

export interface ProductStatsDto {
    totalOrders: number;
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
}