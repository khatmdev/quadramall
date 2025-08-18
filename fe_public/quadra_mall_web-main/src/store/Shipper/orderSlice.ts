import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '@/main';
import type { ShipperOrder } from '@/types/Shipper/order';

interface ShipperOrderState {
  orders: ShipperOrder[];
  currentOrder: ShipperOrder | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const initialState: ShipperOrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  }
};

// Helper function to convert backend datetime array to ISO string
const convertDateTimeArray = (dateArray: number[]): string => {
  if (!dateArray || dateArray.length < 6) return new Date().toISOString();
  
  // Backend returns [year, month, day, hour, minute, second, nanosecond]
  // JavaScript Date expects month to be 0-based
  const [year, month, day, hour, minute, second, nanosecond = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
  return date.toISOString();
};

// Async thunks
export const getMyOrders = createAsyncThunk<
  { content: ShipperOrder[]; totalElements: number; totalPages: number },
  { page: number; size: number },
  { rejectValue: string }
>('shipperOrder/getMyOrders', async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/shipper/my-deliveries?page=${page}&size=${size}`);
    
    // Transform the response data to match ShipperOrder interface
    const transformedContent = response.data.content.map((item: any) => ({
      id: item.id || item.orderId, // Use orderId as fallback for id
      orderCode: item.orderCode || `ORD-${item.orderId}`,
      customerName: item.customerName || 'N/A',
      customerPhone: item.customerPhone || 'N/A',
      customerAddress: item.deliveryAddress || item.customerAddress || 'N/A',
      totalAmount: item.totalAmount || 0,
      status: item.status || 'ASSIGNED_TO_SHIPPER', // Default status
      assignmentStatus: item.assignmentStatus || item.status || 'ASSIGNED',
      items: item.items || [], // Will be empty array if not provided
      pickupAddress: item.pickupAddress || 'N/A',
      deliveryAddress: item.deliveryAddress || 'N/A',
      assignedAt: item.assignedAt ? 
        (Array.isArray(item.assignedAt) ? convertDateTimeArray(item.assignedAt) : item.assignedAt) : 
        new Date().toISOString(),
      pickedUpAt: item.pickedUpAt ? 
        (Array.isArray(item.pickedUpAt) ? convertDateTimeArray(item.pickedUpAt) : item.pickedUpAt) : 
        undefined,
      deliveredAt: item.deliveredAt ? 
        (Array.isArray(item.deliveredAt) ? convertDateTimeArray(item.deliveredAt) : item.deliveredAt) : 
        undefined,
      estimatedDelivery: item.estimatedDeliveryTime ? 
        (Array.isArray(item.estimatedDeliveryTime) ? convertDateTimeArray(item.estimatedDeliveryTime) : item.estimatedDeliveryTime) : 
        new Date().toISOString(),
      notes: item.notes || item.deliveryNotes || '',
      createdAt: item.createdAt ? 
        (Array.isArray(item.createdAt) ? convertDateTimeArray(item.createdAt) : item.createdAt) : 
        new Date().toISOString()
    }));
    
    return {
      content: transformedContent,
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Lấy danh sách đơn hàng thất bại');
    }
    return rejectWithValue('Lấy danh sách đơn hàng thất bại do lỗi không xác định');
  }
});

export const updateOrderStatus = createAsyncThunk<
  ShipperOrder,
  { orderId: number; action: 'pickup' | 'start_delivery' | 'complete' | 'cancel'; data?: any },
  { rejectValue: string }
>('shipperOrder/updateStatus', async ({ orderId, action, data }, { rejectWithValue }) => {
  try {
    let endpoint = '';
    switch (action) {
      case 'pickup':
        endpoint = `/api/shipper/pickup-order/${orderId}`;
        break;
      case 'start_delivery':
        endpoint = `/api/shipper/start-delivery/${orderId}`;
        break;
      case 'complete':
        endpoint = `/api/shipper/complete-delivery/${orderId}`;
        break;
      case 'cancel':
        endpoint = `/api/shipper/cancel-delivery/${orderId}`;
        break;
    }

    const response = await api.post(endpoint, data || {});
    
    // Transform response similar to getMyOrders
    const item = response.data;
    return {
      id: item.id || item.orderId,
      orderCode: item.orderCode || `ORD-${item.orderId}`,
      customerName: item.customerName || 'N/A',
      customerPhone: item.customerPhone || 'N/A',
      customerAddress: item.deliveryAddress || item.customerAddress || 'N/A',
      totalAmount: item.totalAmount || 0,
      status: item.status || 'ASSIGNED_TO_SHIPPER',
      assignmentStatus: item.assignmentStatus || item.status || 'ASSIGNED',
      items: item.items || [],
      pickupAddress: item.pickupAddress || 'N/A',
      deliveryAddress: item.deliveryAddress || 'N/A',
      assignedAt: item.assignedAt ? 
        (Array.isArray(item.assignedAt) ? convertDateTimeArray(item.assignedAt) : item.assignedAt) : 
        new Date().toISOString(),
      pickedUpAt: item.pickedUpAt ? 
        (Array.isArray(item.pickedUpAt) ? convertDateTimeArray(item.pickedUpAt) : item.pickedUpAt) : 
        undefined,
      deliveredAt: item.deliveredAt ? 
        (Array.isArray(item.deliveredAt) ? convertDateTimeArray(item.deliveredAt) : item.deliveredAt) : 
        undefined,
      estimatedDelivery: item.estimatedDeliveryTime ? 
        (Array.isArray(item.estimatedDeliveryTime) ? convertDateTimeArray(item.estimatedDeliveryTime) : item.estimatedDeliveryTime) : 
        new Date().toISOString(),
      notes: item.notes || item.deliveryNotes || '',
      createdAt: item.createdAt ? 
        (Array.isArray(item.createdAt) ? convertDateTimeArray(item.createdAt) : item.createdAt) : 
        new Date().toISOString()
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
    return rejectWithValue('Cập nhật trạng thái thất bại do lỗi không xác định');
  }
});

const shipperOrderSlice = createSlice({
  name: 'shipperOrder',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content;
        state.pagination.totalElements = action.payload.totalElements;
        state.pagination.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the list
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        // Update current order if it matches
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentOrder, clearCurrentOrder } = shipperOrderSlice.actions;
export default shipperOrderSlice.reducer;