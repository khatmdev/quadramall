export interface Voucher {
    id: string;
    code: string;
    title: string;
    discount: number;
    discountType: 'percent' | 'fixed';
    minOrder?: number;
    maxDiscount?: number;
    shopId?: string; // null nếu là voucher của platform
}