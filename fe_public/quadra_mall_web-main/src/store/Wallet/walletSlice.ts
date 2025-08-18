import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/main';
import { WalletState } from '@/types/Wallet/WalletState';
import { OrderRequest } from '@/types/Order/orderRequest';

interface DepositState {
  selectedMethod: string;
  amount: string;
  step: number;
  isProcessing: boolean;
  error: string | null;
}

interface WalletStateExtended extends WalletState {
  deposit: DepositState;
}

const initialState: WalletStateExtended = {
  balance: 0,
  updatedAt: '',
  currentMonthDeposit: 0,
  previousMonthDeposit: 0,
  currentMonthExpense: 0,
  previousMonthExpense: 0,
  transactionHistory: [],
  loading: false,
  error: null,
  deposit: {
    selectedMethod: '',
    amount: '',
    step: 1,
    isProcessing: false,
    error: null,
  },
};

export const fetchWalletData = createAsyncThunk(
  'wallet/fetchWalletData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet data');
    }
  }
);

export const depositMoney = createAsyncThunk(
  'wallet/depositMoney',
  async ({ paymentMethod, amount, orderRequest }: { paymentMethod: string; amount: string; orderRequest?: OrderRequest }, { rejectWithValue }) => {
    try {
      const payload = orderRequest 
        ? { paymentMethod, amount: parseInt(amount), orderRequest }
        : { paymentMethod, amount: parseInt(amount) };
      const response = await api.post('/payment/create-deposit', payload);
      console.log('Deposit successful:', response.data);
      return response.data; // Expect { status, redirectUrl, orderResult? }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi nạp tiền');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedMethod(state, action: { payload: string }) {
      state.deposit.selectedMethod = action.payload;
    },
    setAmount(state, action: { payload: string }) {
      state.deposit.amount = action.payload;
    },
    setStep(state, action: { payload: number }) {
      state.deposit.step = action.payload;
    },
    resetDeposit(state) {
      state.deposit = { selectedMethod: '', amount: '', step: 1, isProcessing: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.updatedAt = action.payload.updatedAt;
        state.currentMonthDeposit = action.payload.currentMonthDeposit;
        state.previousMonthDeposit = action.payload.previousMonthDeposit;
        state.currentMonthExpense = action.payload.currentMonthExpense;
        state.previousMonthExpense = action.payload.previousMonthExpense;
        state.transactionHistory = action.payload.transactionHistory;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(depositMoney.pending, (state) => {
        state.deposit.isProcessing = true;
        state.deposit.error = null;
      })
      .addCase(depositMoney.fulfilled, (state, action) => {
        state.deposit.isProcessing = false;
        state.deposit.step = 3; // Move to success step
        if (action.payload.orderResult) {
          state.balance = action.payload.balance; // Update balance if returned
        }
        if (action.payload.redirectUrl) {
          window.location.href = action.payload.redirectUrl; // Redirect if needed
        }
      })
      .addCase(depositMoney.rejected, (state, action) => {
        state.deposit.isProcessing = false;
        state.deposit.error = action.payload as string;
      });
  },
});

export const { setSelectedMethod, setAmount, setStep, resetDeposit } = walletSlice.actions;
export default walletSlice.reducer;