import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/store/store';
import { updateOrderStatus } from '@/store/orderSlice';
import { addNotification } from '@/store/notificationSlice';

export const updateOrderStatusWithNotification = createAsyncThunk<
    void,
    { id: number; status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' },
    { dispatch: AppDispatch; state: RootState }
>(
    'orders/updateOrderStatusWithNotification',
    async ({ id, status }, { dispatch, getState }) => {
        const state = getState();
        const order = state.orders.orders.find((o) => o.id === id);
        if (order && order.status !== status) {
            dispatch(updateOrderStatus({ id, status }));
            dispatch(
                addNotification({
                    type: 'status_update',
                    orderId: id,
                    message: `Đơn hàng #${id} đã được cập nhật từ "${order.status}" sang "${status}"`,
                })
            );
        }
    }
);