import { api } from '@/main';
import { CheckoutData } from '@/types/Order/interface';
import { OrderRequest } from '@/types/Order/orderRequest';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa kiểu cho selectedItems (chứa cartItemIds)
interface SelectedItem {
  id: number;
}

// Trạng thái Redux (thêm redirectUrl để lưu tạm nếu cần)
interface OrderState {
  selectedItems: SelectedItem[];
  checkoutData: CheckoutData | null;
  loading: boolean;
  error: string | null;
  redirectUrl?: string | null; // Tối ưu: Lưu redirectUrl tạm để component xử lý
}

// Trạng thái ban đầu
const initialState: OrderState = {
  selectedItems: [],
  checkoutData: null,
  loading: false,
  error: null,
  redirectUrl: null,
};
     


export const createOrder = createAsyncThunk('order/createOrder', async (orderRequest: OrderRequest, { rejectWithValue }) => {
  try {
    console.log('Dispatching createOrder with request:', orderRequest); // Log debug
    const response = await api.post('/payment/create-orders', orderRequest);
    if (response.data.status !== 'success') {
      // Giả sử server trả về mã lỗi trong response.data.errorCode hoặc thông báo cụ thể
      const errorCode = response.data.errorCode;
      const errorMessage = response.data.message || 'Không thể tạo hóa đơn';
      if (errorCode === 'INSUFFICIENT_STOCK') {
        return rejectWithValue({ message: 'Sản phẩm không đủ tồn kho', code: errorCode });
      }
      return rejectWithValue({ message: errorMessage });
    }
    return response.data; // { status, redirectUrl, ... }
  } catch (err) {
    console.error('CreateOrder error:', err); // Log error
    return rejectWithValue(err instanceof Error ? { message: err.message } : { message: 'Đã xảy ra lỗi khi đặt hàng' });
  }
});




// Tạo slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setSelectedItems(state, action: PayloadAction<SelectedItem[]>) {
      state.selectedItems = action.payload;
    },
    setCheckoutData(state, action: PayloadAction<CheckoutData>) {
      state.checkoutData = action.payload;
    },
    clearCheckoutData(state) {
      state.checkoutData = null;
      state.error = null;
      state.redirectUrl = null; // Clear redirectUrl
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.redirectUrl = null; // Reset
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Lưu redirectUrl vào state nếu có (tùy chọn, để component dễ access)
        if (action.payload.redirectUrl) {
          state.redirectUrl = action.payload.redirectUrl;
        }
        // Có thể lưu thêm data khác nếu cần
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.redirectUrl = null;
      });
  },
});

// Xuất các action
export const { setSelectedItems, setCheckoutData, clearCheckoutData } = orderSlice.actions;

// Xuất reducer
export default orderSlice.reducer;