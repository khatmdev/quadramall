import type {Address} from "@/types/address.ts";
import type {Shop} from "@/types/shop.ts";
import type {Voucher} from "@/types/voucher.ts";
import type {PaymentMethod} from "@/types/payment.ts";

export interface CheckoutState {
    selectedAddress: Address | null;
    shops: Shop[];
    platformVoucher: Voucher | null;
    paymentMethod: PaymentMethod;
    note: string;
}