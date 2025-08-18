export interface SellerRegistration {
    id: number;
    userId: number;
    userEmail: string;
    userPhone: number;
    userFullName: string;
    storeName: string;
    address: string;
    description: string;
    logoUrl: string;
    businessLicenseUrl: string;
    idCardUrl: string[];
    taxCode: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    createdAt: [number, number, number, number, number, number];
    updatedAt: string;
}

export interface RejectSellerRegistrationRequest {
    rejectionReason: string;
}