import type {Voucher} from "@/types/voucher.ts";
import type {Product} from "@/types/product.ts";

export interface Shop {
    id: string;
    name: string;
    products: Product[];
    shippingFee: number;
    voucher?: Voucher | null;
    note?: string;
}