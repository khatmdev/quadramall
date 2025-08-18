import { api } from '@/main';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface ForgotPasswordState {
  currentStep: 1 | 2 | 3;
  email: string;
  loading: boolean;
  error: string | null;
}

const initialState: ForgotPasswordState = {
  currentStep: 1,
  email: '',
  loading: false,
  error: null,
};

export const sendOtp = createAsyncThunk(
  'forgotPassword/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'forgotPassword/verifyOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, type: 'forgot-password' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async ({ email, newPassword }: { email: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const resendForgotPasswordOtp = createAsyncThunk(
  'forgotPassword/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/otp/resend', null, { params: { email, type: 'forgot-password' } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    resetForgotPasswordState: (state) => {
      state.currentStep = 1;
      state.email = '';
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStep = 2;
        state.email = action.meta.arg;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.currentStep = 3;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resendForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendForgotPasswordOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;