import type {Voucher} from "@/types/voucher.ts";

export const calculateDiscount = (
    subtotal: number,
    voucher: Voucher | null
): number => {
    if (!voucher) return 0;

    if (voucher.minOrder && subtotal < voucher.minOrder) return 0;

    let discount = 0;

    if (voucher.discountType === 'percent') {
        discount = (subtotal * voucher.discount) / 100;
        if (voucher.maxDiscount) {
            discount = Math.min(discount, voucher.maxDiscount);
        }
    } else {
        discount = voucher.discount;
    }

    return Math.min(discount, subtotal);
};