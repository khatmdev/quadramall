// Existing utility functions
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatDateTime = (
    dateInput: string | number | Date,
    options?: { withTime?: boolean }
): string => {
    const date = new Date(dateInput);
    const withTime = options?.withTime ?? true;

    const day = date.toLocaleDateString('vi-VN'); // "dd/mm/yyyy"
    const time = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }); // "HH:mm"

    return withTime ? `${day} ${time}` : day;
};


export const getTotalAmount = (checkoutData: any): number => {
    if (!checkoutData || !checkoutData.orderResponse) return 0;
    
    return checkoutData.orderResponse.reduce((total: number, order: any) => {
        const orderTotal = order.orderItemResponses.reduce(
            (sum: number, item: any) => sum + item.totalItemPrice,
            0
        );
        return total + orderTotal;
    }, 0);
};

export const getTotalShipping = (checkoutData: any): number => {
    if (!checkoutData || !checkoutData.orderResponse) return 0;
    
    return checkoutData.orderResponse.reduce(
        (total: number, order: any) => total + (order.shippingCost || 0),
        0
    );
};

// Voucher-specific utility functions
export const calculateVoucherDiscount = (
    voucher: any,
    orderAmount: number
): number => {
    if (!voucher || orderAmount < voucher.minOrderAmount) return 0;
    
    if (voucher.discountType === 'PERCENTAGE') {
        const discount = (orderAmount * voucher.discountValue) / 100;
        return voucher.maxDiscountValue 
            ? Math.min(discount, voucher.maxDiscountValue)
            : discount;
    }
    
    return Math.min(voucher.discountValue, orderAmount);
};

export const getTotalDiscount = (
    checkoutData: any,
    selectedVouchers: { [storeId: number]: any }
): number => {
    if (!checkoutData || !checkoutData.orderResponse) return 0;
    
    return checkoutData.orderResponse.reduce((totalDiscount: number, order: any) => {
        const voucher = selectedVouchers[order.store.id];
        if (!voucher) return totalDiscount;
        
        const orderProductTotal = order.orderItemResponses.reduce(
            (sum: number, item: any) => sum + item.totalItemPrice,
            0
        );
        
        return totalDiscount + calculateVoucherDiscount(voucher, orderProductTotal);
    }, 0);
};

export const isVoucherApplicable = (
    voucher: any,
    orderAmount: number,
    productIds?: number[]
): boolean => {
    // Check minimum order amount
    if (orderAmount < voucher.minOrderAmount) return false;
    
    // Check if voucher is active
    if (!voucher.isActive) return false;
    
    // Check expiry date
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    if (now > endDate) return false;
    
    // Check product applicability
    if (voucher.appliesTo === 'PRODUCTS' && productIds) {
        const hasApplicableProduct = productIds.some(
            productId => voucher.productIds?.includes(productId)
        );
        if (!hasApplicableProduct) return false;
    }
    
    return true;
};

export const formatVoucherDescription = (voucher: any): string => {
    let description = '';
    
    if (voucher.discountType === 'PERCENTAGE') {
        description = `Giảm ${voucher.discountValue}%`;
        if (voucher.maxDiscountValue) {
            description += ` (tối đa ${formatCurrency(voucher.maxDiscountValue)})`;
        }
    } else {
        description = `Giảm ${formatCurrency(voucher.discountValue)}`;
    }
    
    description += ` cho đơn từ ${formatCurrency(voucher.minOrderAmount)}`;
    
    if (voucher.appliesTo === 'PRODUCTS' && voucher.productNames?.length > 0) {
        description += ` - Áp dụng cho: ${voucher.productNames.join(', ')}`;
    }
    
    return description;
};

export const sortVouchersByBestValue = (
    vouchers: any[],
    orderAmount: number
): any[] => {
    return vouchers.sort((a, b) => {
        const discountA = calculateVoucherDiscount(a, orderAmount);
        const discountB = calculateVoucherDiscount(b, orderAmount);
        return discountB - discountA;
    });
};

export const groupVouchersByStore = (
    vouchers: any[]
): { [storeId: number]: any[] } => {
    return vouchers.reduce((grouped, voucher) => {
        const storeId = voucher.storeId;
        if (!grouped[storeId]) {
            grouped[storeId] = [];
        }
        grouped[storeId].push(voucher);
        return grouped;
    }, {});
};