import { api } from '@/main';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Transaction {
  transactionId: number;
  type: string;
  status: string;
  description: string;
  amount: number;
  updateAt: string;
}

interface TransactionHistoryState {
  transactions: Transaction[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionHistoryState = {
  transactions: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  error: null,
};

interface FetchTransactionsParams {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  size: number;
}

export const fetchTransactionHistory = createAsyncThunk(
  'transactionHistory/fetchTransactionHistory',
  async (params: FetchTransactionsParams, { rejectWithValue }) => {
    try {
      // Tạo object params chỉ chứa những giá trị có thực sự
      const queryParams: Record<string, any> = {
        page: params.page,
        size: params.size,
      };

      // Chỉ thêm param nếu có giá trị thực sự (không rỗng/null/undefined)
      if (params.type && params.type.trim() !== '') {
        queryParams.type = params.type.trim();
      }

      if (params.status && params.status.trim() !== '') {
        queryParams.status = params.status.trim();
      }

      if (params.startDate && params.startDate.trim() !== '') {
        queryParams.startDate = params.startDate.trim();
      }

      if (params.endDate && params.endDate.trim() !== '') {
        queryParams.endDate = params.endDate.trim();
      }

      console.log('Sending query params:', queryParams);

      const response = await api.get('/wallet/transactions', {
        params: queryParams,
      });
      
      console.log('Transaction History Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Transaction History Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const transactionHistorySlice = createSlice({
  name: 'transactionHistory',
  initialState,
  reducers: {
    // Thêm reducer để clear error
    clearError: (state) => {
      state.error = null;
    },
    // Thêm reducer để reset state
    resetTransactionHistory: (state) => {
      state.transactions = [];
      state.totalPages = 0;
      state.totalElements = 0;
      state.currentPage = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.content || [];
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
        state.currentPage = action.payload.number || 0;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Không clear transactions khi có lỗi, giữ nguyên data cũ
      });
  },
});

export const { clearError, resetTransactionHistory } = transactionHistorySlice.actions;
export default transactionHistorySlice.reducer;