// src/types/sellerRegistration.ts

// Enum cho trạng thái đăng ký
export enum RegistrationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

// Enum cho trạng thái store
export enum StoreStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED',
    REPORTED = 'REPORTED'
}

// Interface cho request đăng ký cửa hàng
export interface SellerRegistrationRequest {
    email: string;
    storeName: string;
    address: string;
    description?: string;
    taxCode?: string;
    logoUrl?: string;
    businessLicenseUrl?: string;
    idCardUrl: string[]; // Danh sách 2 URL (mặt trước và mặt sau)
}

// Interface cho request cập nhật đăng ký (khi REJECTED)
export interface RegistrationUpdateRequest {
    storeName: string;
    address: string;
    description?: string;
    taxCode?: string;
    logoUrl?: string;
    businessLicenseUrl?: string;
    idCardUrl: string[];
}

// Interface cho response từ server (đăng ký và cập nhật)
export interface SellerRegistrationResponse {
    id: number;
    email: string;
    storeName: string;
    address: string;
    description?: string;
    taxCode?: string;
    logoUrl?: string;
    businessLicenseUrl?: string;
    idCardUrl: string[];
    status: RegistrationStatus;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    // Thông tin user
    userId: number;
    userFullName?: string;
    userPhoneNumber?: string;
}

// Interface cho chi tiết đăng ký (để load form edit)
export interface RegistrationDetails {
    id: number;

    // Thông tin cửa hàng
    storeName: string;
    description?: string;

    // Thông tin địa chỉ đã parse
    address: string; // Địa chỉ đầy đủ
    pickupContactName?: string;
    pickupContactPhone?: string;
    specificAddress?: string; // Địa chỉ cụ thể
    ward?: string;
    district?: string;
    city?: string;

    // Thông tin user
    email: string;
    phone?: string;

    // Thông tin thuế và documents
    taxCode?: string;
    logoUrl?: string;
    businessLicenseUrl?: string;
    idCardUrl: string[];

    // Trạng thái và metadata
    status: RegistrationStatus;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Interface cho thông tin store
export interface StoreInfo {
    storeId: number;
    storeName: string;
    storeStatus: StoreStatus;
    createdAt: string;
}

// Interface cho tổng quan trạng thái user (registration + stores)
export interface UserStoreStatus {
    // Thông tin registration
    registrationId?: number;
    registrationStatus?: RegistrationStatus;
    rejectionReason?: string;
    registrationCreatedAt?: string;

    // Thông tin stores (sau khi approve)
    stores?: StoreInfo[];

    // Có đăng ký hay không
    hasRegistration: boolean;
}

// Interface cho API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface StoreInfoDto {
    id: number;
    name: string;
    slug: string;
    address?: string;
    description?: string;
    logoUrl?: string;
    status: StoreStatus;
    lockReason?: string;
    createdAt: string;
    updatedAt: string;
}