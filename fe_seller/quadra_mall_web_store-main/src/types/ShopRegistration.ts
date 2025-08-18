export interface ShopFormData {
    shopName: string;
    email: string;
    phone: string;
    pickupContactPhone: string;
    pickupContactName: string;
    fullName: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    description: string;
    idNumber: string;
    idFrontImage: File | null;
    idBackImage: File | null;
    businessLicense: File | null;
    logo: File | null;
}