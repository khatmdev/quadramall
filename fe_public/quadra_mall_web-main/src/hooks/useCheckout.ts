// hooks/useCheckout.ts
import { useState, useCallback, useMemo } from 'react';
import { calculateDiscount } from '../utils/discount';
import type {Address} from "@/types/address.ts";
import type {Shop} from "@/types/shop.ts";
import type {CheckoutState} from "@/types/checkout.ts";
import type {PaymentMethod} from "@/types/payment.ts";
import type {Voucher} from "@/types/voucher.ts";

export const useCheckout = (initialData: {
    addresses: Address[];
    shops: Shop[];
}) => {
    const [state, setState] = useState<CheckoutState>({
        selectedAddress: initialData.addresses.find(addr => addr.isDefault) || null,
        shops: initialData.shops,
        platformVoucher: null,
        paymentMethod: 'cod',
        note: '',
    });

    const setSelectedAddress = useCallback((address: Address | null) => {
        setState(prev => ({ ...prev, selectedAddress: address }));
    }, []);

    const setPaymentMethod = useCallback((method: PaymentMethod) => {
        setState(prev => ({ ...prev, paymentMethod: method }));
    }, []);

    const setPlatformVoucher = useCallback((voucher: Voucher | null) => {
        setState(prev => ({ ...prev, platformVoucher: voucher }));
    }, []);

    const setShopVoucher = useCallback((shopId: string, voucher: Voucher | null) => {
        setState(prev => ({
            ...prev,
            shops: prev.shops.map(shop =>
                shop.id === shopId ? { ...shop, voucher } : shop
            ),
        }));
    }, []);

    const setNote = useCallback((note: string) => {
        setState(prev => ({ ...prev, note }));
    }, []);

    const updateQuantity = useCallback((shopId: string, productId: string, quantity: number) => {
        setState(prev => ({
            ...prev,
            shops: prev.shops.map(shop =>
                shop.id === shopId
                    ? {
                        ...shop,
                        products: shop.products.map(product =>
                            product.id === productId ? { ...product, quantity } : product
                        ),
                    }
                    : shop
            ),
        }));
    }, []);

    const setShopNote = useCallback((shopId: string, note: string) => {
        setState(prev => ({
            ...prev,
            shops: prev.shops.map(shop =>
                shop.id === shopId ? { ...shop, note } : shop
            ),
        }));
    }, []);

    const totals = useMemo(() => {
        const subtotal = state.shops.reduce(
            (total, shop) =>
                total + shop.products.reduce((shopTotal, product) => shopTotal + product.price * product.quantity, 0),
            0
        );

        const shippingFee = state.shops.reduce((total, shop) => total + shop.shippingFee, 0);

        const shopVoucherDiscount = state.shops.reduce(
            (total, shop) => total + calculateDiscount(
                shop.products.reduce((shopTotal, product) => shopTotal + product.price * product.quantity, 0),
                shop.voucher || null
            ),
            0
        );

        const platformVoucherDiscount = calculateDiscount(subtotal - shopVoucherDiscount, state.platformVoucher);

        const total = subtotal + shippingFee - shopVoucherDiscount - platformVoucherDiscount;

        return {
            subtotal,
            shippingFee,
            shopVoucherDiscount,
            platformVoucherDiscount,
            total: Math.max(0, total),
        };
    }, [state.shops, state.platformVoucher]);

    return {
        state,
        actions: {
            setSelectedAddress,
            setPaymentMethod,
            setPlatformVoucher,
            setShopVoucher,
            setNote,
            updateQuantity,
            setShopNote, // Add the new action
        },
        totals,
    };
};