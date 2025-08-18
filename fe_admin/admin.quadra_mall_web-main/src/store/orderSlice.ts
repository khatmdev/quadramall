import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id?: number;
    quantity: number;
    price_at_time: number;
    product_name: string;
    variant_name?: string;
    product_image: string;
}

interface Order {
    id: number;
    customer_id: number;
    store_id: number;
    customer_name: string;
    customer_phone: string;
    store_name: string;
    store_address: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_method: 'standard' | 'express';
    payment_method: 'cod' | 'online';
    payment_status: 'pending' | 'completed' | 'failed';
    total_amount: number;
    created_at: string;
    note?: string;
    discount_code_id?: number;
    shipping_partner?: string;
    tracking_number?: string;
    shipping_cost?: number;
    shipping_address: string;
    items: OrderItem[];
}

interface OrderState {
    orders: Order[];
    searchQuery: string;
    filterStatus: string;
}

const initialState: OrderState = {
    orders: [
        {
            id: 1,
            customer_id: 1,
            store_id: 1,
            customer_name: 'Nguyễn Văn A',
            customer_phone: '0123456789',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'pending',
            shipping_method: 'standard',
            payment_method: 'cod',
            payment_status: 'pending',
            total_amount: 150000,
            created_at: '2025-06-09T14:09:00',
            note: 'Giao nhanh trước 3PM',
            shipping_partner: 'Giao Hàng Nhanh',
            tracking_number: 'GHN123456',
            shipping_cost: 20000,
            shipping_address: '123 Đường ABC, Quận XYZ, TP.HCM',
            items: [
                {
                    id: 1,
                    order_id: 1,
                    product_id: 1,
                    quantity: 2,
                    price_at_time: 50000,
                    product_name: 'Cà phê sữa',
                    variant_name: 'Size M',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497789/download_3_pji6u7.jpg',
                },
                {
                    id: 2,
                    order_id: 1,
                    product_id: 2,
                    quantity: 1,
                    price_at_time: 50000,
                    product_name: 'Trà đào',
                    variant_name: 'Size L',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497639/download_2_yfu8ff.jpg',
                },
            ],
        },
        {
            id: 2,
            customer_id: 2,
            store_id: 1,
            customer_name: 'Trần Thị B',
            customer_phone: '0987654321',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'shipped',
            shipping_method: 'express',
            payment_method: 'online',
            payment_status: 'completed',
            total_amount: 250000,
            created_at: '2025-06-09T14:15:00',
            shipping_partner: 'Giao Hàng Tiết Kiệm',
            tracking_number: 'GHTK789012',
            shipping_cost: 30000,
            shipping_address: '789 Đường KLM, Quận NOP, TP.HCM',
            items: [
                {
                    id: 3,
                    order_id: 2,
                    product_id: 3,
                    quantity: 3,
                    price_at_time: 80000,
                    product_name: 'Cà phê đen',
                    variant_name: 'Size L',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497789/download_3_pji6u7.jpg',
                },
            ],
        },
        {
            id: 3,
            customer_id: 3,
            store_id: 1,
            customer_name: 'Lê Văn C',
            customer_phone: '0901122334',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'processing',
            shipping_method: 'standard',
            payment_method: 'cod',
            payment_status: 'pending',
            total_amount: 120000,
            created_at: '2025-06-09T15:20:00',
            shipping_partner: 'VNPost',
            tracking_number: 'VN12345678',
            shipping_cost: 15000,
            shipping_address: '45 Đường QRS, Quận TUV, TP.HCM',
            items: [
                {
                    id: 4,
                    order_id: 3,
                    product_id: 4,
                    quantity: 2,
                    price_at_time: 60000,
                    product_name: 'Sinh tố xoài',
                    variant_name: 'Size L',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497640/download_4_ydhd0c.jpg',
                },
            ],
        },
        {
            id: 4,
            customer_id: 4,
            store_id: 1,
            customer_name: 'Phạm Thị D',
            customer_phone: '0933555777',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'delivered',
            shipping_method: 'express',
            payment_method: 'online',
            payment_status: 'completed',
            total_amount: 180000,
            created_at: '2025-06-08T11:45:00',
            note: 'Giao buổi sáng',
            shipping_partner: 'GrabExpress',
            tracking_number: 'GRBEXP0001',
            shipping_cost: 25000,
            shipping_address: '234 Đường MNO, Quận PQR, TP.HCM',
            items: [
                {
                    id: 5,
                    order_id: 4,
                    product_id: 5,
                    quantity: 1,
                    price_at_time: 180000,
                    product_name: 'Set bánh ngọt',
                    variant_name: 'Combo 3 món',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497641/download_5_f4mhug.jpg',
                },
            ],
        },
        {
            id: 5,
            customer_id: 5,
            store_id: 1,
            customer_name: 'Hoàng Văn E',
            customer_phone: '0977333111',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'cancelled',
            shipping_method: 'standard',
            payment_method: 'cod',
            payment_status: 'failed',
            total_amount: 100000,
            created_at: '2025-06-07T09:30:00',
            shipping_cost: 10000,
            shipping_address: '567 Đường STU, Quận VWX, TP.HCM',
            items: [
                {
                    id: 6,
                    order_id: 5,
                    product_id: 6,
                    quantity: 2,
                    price_at_time: 50000,
                    product_name: 'Nước cam tươi',
                    variant_name: 'Size M',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497642/download_6_ylxncb.jpg',
                },
            ],
        },
        {
            id: 6,
            customer_id: 6,
            store_id: 1,
            customer_name: 'Ngô Thị F',
            customer_phone: '0911222333',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'pending',
            shipping_method: 'express',
            payment_method: 'online',
            payment_status: 'pending',
            total_amount: 90000,
            created_at: '2025-06-09T16:50:00',
            shipping_partner: 'Ahamove',
            tracking_number: 'AHM000567',
            shipping_cost: 12000,
            shipping_address: '88 Đường YZ, Quận ABC, TP.HCM',
            items: [
                {
                    id: 7,
                    order_id: 6,
                    product_id: 7,
                    quantity: 1,
                    price_at_time: 90000,
                    product_name: 'Matcha đá xay',
                    variant_name: 'Size L',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497643/download_7_wqjzct.jpg',
                },
            ],
        },
        {
            id: 7,
            customer_id: 7,
            store_id: 1,
            customer_name: 'Đặng Văn G',
            customer_phone: '0944556677',
            store_name: 'Quán Cà Phê Sáng',
            store_address: '456 Đường DEF, Quận GHI, TP.HCM',
            status: 'processing',
            shipping_method: 'standard',
            payment_method: 'cod',
            payment_status: 'pending',
            total_amount: 140000,
            created_at: '2025-06-10T08:10:00',
            shipping_partner: 'Ninja Van',
            tracking_number: 'NV567890',
            shipping_cost: 18000,
            shipping_address: '101 Đường DEF, Quận GHI, TP.HCM',
            items: [
                {
                    id: 8,
                    order_id: 7,
                    product_id: 8,
                    quantity: 2,
                    price_at_time: 70000,
                    product_name: 'Trà sữa trân châu',
                    variant_name: 'Size L',
                    product_image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749497644/download_8_oz0kfl.jpg',
                },
            ],
        },
    ],
    searchQuery: '',
    filterStatus: '',
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        setFilterStatus(state, action: PayloadAction<string>) {
            state.filterStatus = action.payload;
        },
        updateOrderStatus(state, action: PayloadAction<{ id: number; status: Order['status'] }>) {
            const order = state.orders.find((o) => o.id === action.payload.id);
            if (order) {
                order.status = action.payload.status;
            }
        },
        addNewOrder(state, action: PayloadAction<Order>) {
            state.orders.unshift(action.payload);
        },
    },
});

export const { setSearchQuery, setFilterStatus, updateOrderStatus, addNewOrder } = orderSlice.actions;
export default orderSlice.reducer;