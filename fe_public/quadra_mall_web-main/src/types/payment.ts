export type PaymentMethod = 'momo' | 'vnpay' | 'cod';

export interface PaymentOption {
    id: PaymentMethod;
    name: string;
    icon: string;
    description?: string;
}