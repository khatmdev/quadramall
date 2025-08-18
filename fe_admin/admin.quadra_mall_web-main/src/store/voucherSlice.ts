// store/voucherSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Voucher {
    id: string;
    name: string;
    code: string;
    type: 'shop' | 'product'; // voucher toàn shop hoặc sản phẩm cụ thể
    discountType: 'percentage' | 'fixed'; // giảm theo % hoặc số tiền cố định
    discountValue: number;
    minOrderValue?: number; // giá trị đơn hàng tối thiểu
    maxDiscountValue?: number; // giá trị giảm tối đa (cho discount %)
    usageLimit: number; // số lượng voucher có thể sử dụng
    usedCount: number; // số lượng đã sử dụng
    startDate: string;
    endDate: string;
    status: 'active' | 'inactive' | 'expired';
    applicableProducts?: string[]; // danh sách ID sản phẩm áp dụng (nếu type = 'product')
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface VoucherState {
    vouchers: Voucher[];
    products: Product[]; // danh sách sản phẩm để chọn khi tạo voucher
    isLoading: boolean;
    error: string | null;
    filters: {
        search: string;
        type: 'all' | 'shop' | 'product';
        status: 'all' | 'active' | 'inactive' | 'expired';
    };
    selectedVoucher: Voucher | null;
    isModalOpen: boolean;
}

// Dữ liệu mẫu
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'iPhone 15 Pro Max',
        price: 29990000,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        price: 26990000,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'
    },
    {
        id: '3',
        name: 'MacBook Pro M3',
        price: 45990000,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    },
    {
        id: '4',
        name: 'Dell XPS 13',
        price: 35990000,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
    },
    {
        id: '5',
        name: 'AirPods Pro',
        price: 6990000,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400'
    }
];

const mockVouchers: Voucher[] = [
    {
        id: '1',
        name: 'Giảm giá toàn shop 10%',
        code: 'SHOP10',
        type: 'shop',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscountValue: 100000,
        usageLimit: 100,
        usedCount: 25,
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'active',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z'
    },
    {
        id: '2',
        name: 'Giảm 500K cho điện thoại',
        code: 'PHONE500',
        type: 'product',
        discountType: 'fixed',
        discountValue: 500000,
        minOrderValue: 15000000,
        usageLimit: 50,
        usedCount: 12,
        startDate: '2025-06-01',
        endDate: '2025-07-31',
        status: 'active',
        applicableProducts: ['1', '2'],
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z'
    },
    {
        id: '3',
        name: 'Khuyến mãi laptop 15%',
        code: 'LAPTOP15',
        type: 'product',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 20000000,
        maxDiscountValue: 2000000,
        usageLimit: 30,
        usedCount: 8,
        startDate: '2025-05-15',
        endDate: '2025-06-15',
        status: 'expired',
        applicableProducts: ['3', '4'],
        createdAt: '2025-05-15T00:00:00Z',
        updatedAt: '2025-05-15T00:00:00Z'
    },
    {
        id: '4',
        name: 'Giảm giá cuối năm 20%',
        code: 'YEAR20',
        type: 'shop',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 1000000,
        maxDiscountValue: 500000,
        usageLimit: 200,
        usedCount: 0,
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        status: 'inactive',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z'
    }
];

const initialState: VoucherState = {
    vouchers: mockVouchers,
    products: mockProducts,
    isLoading: false,
    error: null,
    filters: {
        search: '',
        type: 'all',
        status: 'all'
    },
    selectedVoucher: null,
    isModalOpen: false
};

const voucherSlice = createSlice({
    name: 'vouchers',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<VoucherState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        addVoucher: (state, action: PayloadAction<Omit<Voucher, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>>) => {
            const newVoucher: Voucher = {
                ...action.payload,
                id: Date.now().toString(),
                usedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            state.vouchers.unshift(newVoucher);
        },
        updateVoucher: (state, action: PayloadAction<Voucher>) => {
            const index = state.vouchers.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.vouchers[index] = {
                    ...action.payload,
                    updatedAt: new Date().toISOString()
                };
            }
        },
        deleteVoucher: (state, action: PayloadAction<string>) => {
            state.vouchers = state.vouchers.filter(v => v.id !== action.payload);
        },
        toggleVoucherStatus: (state, action: PayloadAction<string>) => {
            const voucher = state.vouchers.find(v => v.id === action.payload);
            if (voucher) {
                voucher.status = voucher.status === 'active' ? 'inactive' : 'active';
                voucher.updatedAt = new Date().toISOString();
            }
        },
        setSelectedVoucher: (state, action: PayloadAction<Voucher | null>) => {
            state.selectedVoucher = action.payload;
        },
        setModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isModalOpen = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setFilters,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus,
    setSelectedVoucher,
    setModalOpen,
    setLoading,
    setError
} = voucherSlice.actions;

export default voucherSlice.reducer;