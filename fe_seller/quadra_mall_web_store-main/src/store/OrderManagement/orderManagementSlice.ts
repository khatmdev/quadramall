import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/main';
import {
  OrderManagementState,
  OrderStats,
  OrderListResponse,
  OrderDetail,
  OrderFilterRequest,
  UpdateOrderStatusRequest,
  OrderStatus,
  OrderSummary,
} from '@/types/OrderManagement';
import { RootState } from '..';

// API Response wrapper interface
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: number;
}

const initialState: OrderManagementState = {
    stats: null,
    statsLoading: false,
    orders: [],
    orderListLoading: false,
    pagination: {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
    },
    filters: {},
    selectedOrder: null,
    orderDetailLoading: false,
    selectedOrderIds: [],
    error: null,
    updating: false,
};

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errorCode) {
    return `Lỗi ${error.response.data.errorCode}: ${error.response.data.message || 'Có lỗi xảy ra'}`;
  }
  if (error.message) {
    return error.message;
  }
  return 'Có lỗi không xác định xảy ra';
};

// Async thunks
export const fetchOrderStats = createAsyncThunk<OrderStats, { storeId: number }, { state: RootState }>(
  'orderManagement/fetchStats',
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<OrderStats>>(`/seller/orders/stats?storeId=${storeId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchOrders = createAsyncThunk<
  OrderListResponse,
  {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
    storeId: number;
    filters?: OrderFilterRequest;
  },
  { state: RootState }
>(
  'orderManagement/fetchOrders',
  async (
    { page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC', storeId, filters = {} },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
        storeId: storeId.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')),
      });

      const response = await api.get<ApiResponse<OrderListResponse>>(`/seller/orders?${params}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchOrderDetail = createAsyncThunk<OrderDetail, number>(
  'orderManagement/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<OrderDetail>>(`/seller/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  string,
  { orderId: number; request: UpdateOrderStatusRequest }
>(
  'orderManagement/updateOrderStatus',
  async ({ orderId, request }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<void>>(`/seller/orders/${orderId}/status`, request);
      return response.data.message || 'Cập nhật trạng thái thành công';
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateMultipleOrderStatus = createAsyncThunk<
  string,
  UpdateOrderStatusRequest
>(
  'orderManagement/updateMultipleOrderStatus',
  async (request, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<void>>('/seller/orders/batch/status', request);
      return response.data.message || 'Cập nhật trạng thái nhiều đơn hàng thành công';
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const confirmOrder = createAsyncThunk<
  string,
  { orderId: number; note?: string }
>(
  'orderManagement/confirmOrder',
  async ({ orderId, note }, { rejectWithValue }) => {
    try {
      const params = note ? `?note=${encodeURIComponent(note)}` : '';
      const response = await api.post<ApiResponse<void>>(`/seller/orders/${orderId}/confirm${params}`);
      return response.data.message || 'Xác nhận đơn hàng thành công';
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const prepareOrder = createAsyncThunk<
  string,
  { orderId: number; note?: string }
>(
  'orderManagement/prepareOrder',
  async ({ orderId, note }, { rejectWithValue }) => {
    try {
      const params = note ? `?note=${encodeURIComponent(note)}` : '';
      const response = await api.post<ApiResponse<void>>(`/seller/orders/${orderId}/prepare${params}`);
      return response.data.message || 'Chuẩn bị đơn hàng thành công';
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const cancelOrder = createAsyncThunk<
  string,
  { orderId: number; reason: string }
>(
  'orderManagement/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<void>>(
        `/seller/orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`
      );
      return response.data.message || 'Hủy đơn hàng thành công';
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchOrderTimeline = createAsyncThunk<any[], number>(
  'orderManagement/fetchOrderTimeline',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/seller/orders/${orderId}/timeline`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const checkCanUpdateOrder = createAsyncThunk<boolean, number>(
  'orderManagement/checkCanUpdateOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<boolean>>(`/seller/orders/${orderId}/can-update`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchAvailableStatusTransitions = createAsyncThunk<
  OrderStatus[],
  OrderStatus
>(
  'orderManagement/fetchAvailableStatusTransitions',
  async (currentStatus, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<OrderStatus[]>>(
        `/seller/orders/status-transitions?currentStatus=${currentStatus}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const orderManagementSlice = createSlice({
  name: 'orderManagement',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<OrderFilterRequest>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedOrderIds: (state, action: PayloadAction<number[]>) => {
      state.selectedOrderIds = action.payload;
    },
    toggleOrderSelection: (state, action: PayloadAction<number>) => {
      const orderId = action.payload;
      const index = state.selectedOrderIds.indexOf(orderId);
      if (index > -1) {
        state.selectedOrderIds.splice(index, 1);
      } else {
        state.selectedOrderIds.push(orderId);
      }
    },
    selectAllOrders: (state, action: PayloadAction<{ orderIds: number[]; status?: OrderStatus }>) => {
      const { orderIds, status } = action.payload;
      if (status) {
        const eligibleOrders = state.orders
          .filter((order) => order.status === status && orderIds.includes(order.id))
          .map((order) => order.id);
        state.selectedOrderIds = eligibleOrders;
      } else {
        state.selectedOrderIds = orderIds;
      }
    },
    clearSelection: (state) => {
      state.selectedOrderIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOrderInList: (state, action: PayloadAction<{ orderId: number; updates: Partial<OrderSummary> }>) => {
      const { orderId, updates } = action.payload;
      const orderIndex = state.orders.findIndex((order) => order.id === orderId);
      if (orderIndex > -1) {
        state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
      }
    },
    resetOrderDetail: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Stats
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.orderListLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orderListLoading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        };
        state.selectedOrderIds = [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.orderListLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Order Detail
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.orderDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.orderDetailLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.orderDetailLoading = false;
        state.error = action.payload as string;
        state.selectedOrder = null;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Update Multiple Order Status
    builder
      .addCase(updateMultipleOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMultipleOrderStatus.fulfilled, (state) => {
        state.updating = false;
        state.selectedOrderIds = [];
      })
      .addCase(updateMultipleOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Confirm Order
    builder
      .addCase(confirmOrder.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(confirmOrder.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Prepare Order
    builder
      .addCase(prepareOrder.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(prepareOrder.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(prepareOrder.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Fetch Order Timeline
    builder.addCase(fetchOrderTimeline.fulfilled, (state, action) => {
      if (state.selectedOrder) {
        state.selectedOrder.timeline = action.payload;
      }
    });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedOrderIds,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  clearError,
  updateOrderInList,
  resetOrderDetail,
} = orderManagementSlice.actions;

export default orderManagementSlice.reducer;