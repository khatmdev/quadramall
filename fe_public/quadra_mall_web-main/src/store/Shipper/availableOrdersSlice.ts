import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '@/main';

export interface AvailableOrder {
  id?: number; // Optional since backend might not provide this
  orderId: number;
  storeName: string;
  totalAmount: number;
  pickupAddress: string;
  pickupProvince: string;
  pickupDistrict: string;
  pickupWard: string;
  deliveryAddress: string;
  deliveryProvince: string;
  deliveryDistrict: string;
  deliveryWard: string;
  shippingCost: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  distanceKm: number;
  createdAt: string;
}

interface AvailableOrdersState {
  orders: AvailableOrder[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const initialState: AvailableOrdersState = {
  orders: [],
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
export const getAvailableOrders = createAsyncThunk<
  { content: AvailableOrder[]; totalElements: number; totalPages: number },
  { page: number; size: number },
  { rejectValue: string }
>('availableOrders/getOrders', async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/shipper/available-orders?page=${page}&size=${size}`);
    
    // Transform the response data to match AvailableOrder interface
    const transformedContent = response.data.content.map((item: any, index: number) => ({
      id: item.id || item.orderId || index, // Use orderId or index as fallback for id
      orderId: item.orderId,
      storeName: item.storeName || 'N/A',
      totalAmount: item.totalAmount || 0,
      pickupAddress: item.pickupAddress || 'N/A',
      pickupProvince: item.pickupProvince || 'N/A',
      pickupDistrict: item.pickupDistrict || 'N/A',
      pickupWard: item.pickupWard || 'N/A',
      deliveryAddress: item.deliveryAddress || 'N/A',
      deliveryProvince: item.deliveryProvince || 'N/A',
      deliveryDistrict: item.deliveryDistrict || 'N/A',
      deliveryWard: item.deliveryWard || 'N/A',
      shippingCost: item.shippingCost || 0,
      estimatedPickupTime: item.estimatedPickupTime ? 
        (Array.isArray(item.estimatedPickupTime) ? convertDateTimeArray(item.estimatedPickupTime) : item.estimatedPickupTime) : 
        new Date().toISOString(),
      estimatedDeliveryTime: item.estimatedDeliveryTime ? 
        (Array.isArray(item.estimatedDeliveryTime) ? convertDateTimeArray(item.estimatedDeliveryTime) : item.estimatedDeliveryTime) : 
        new Date().toISOString(),
      distanceKm: item.distanceKm || 0,
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

export const acceptOrder = createAsyncThunk<
  { message: string },
  { orderId: number; notes?: string },
  { rejectValue: string }
>('availableOrders/acceptOrder', async ({ orderId, notes }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/shipper/accept-order/${orderId}`, { notes: notes || '' });
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Nhận đơn hàng thất bại');
    }
    return rejectWithValue('Nhận đơn hàng thất bại do lỗi không xác định');
  }
});

const availableOrdersSlice = createSlice({
  name: 'availableOrders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    removeAcceptedOrder: (state, action) => {
      state.orders = state.orders.filter(order => order.orderId !== action.payload);
    },
    setPagination: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get available orders
      .addCase(getAvailableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content;
        state.pagination.totalElements = action.payload.totalElements;
        state.pagination.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(getAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Note: Order will be removed from list via removeAcceptedOrder action
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, removeAcceptedOrder, setPagination } = availableOrdersSlice.actions;
export default availableOrdersSlice.reducer;