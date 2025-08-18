import { api } from '@/main';
import { RegisterRequest } from '@/types/Auth/base/Request/registerRequest';
import { RegisterResponse } from '@/types/Auth/base/Response/registerResponse';
import { RegisterState } from '@/types/Auth/sates/RegisterState';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/*
  registerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  registerData: RegisterRequest | null;
*/


const initialState: RegisterState = {
  registerStatus: 'idle',
  verifyStatus: 'idle',
  error: null,
  registerData: null,
};

// Thunk để gửi yêu cầu đăng ký
export const initiateRegister = createAsyncThunk(
  'auth/initiateRegister',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

// Thunk để xác minh OTP
export const verifyRegister = createAsyncThunk(
  'auth/verifyRegister',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register/verify', null, {
        params: { email, otp },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh OTP thất bại');
    }
  }
);

// Thunk để gửi lại OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({email, type} : {email : string, type : string}, { rejectWithValue }) => {
    const emailType = type === 'register';
    try {
      const response = await api.post('/auth/otp/resend',null, { params: { email,type } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  }
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.registerStatus = 'idle';
      state.verifyStatus = 'idle';
      state.error = null;
      state.registerData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateRegister.pending, (state) => {
        state.registerStatus = 'loading';
        state.error = null;
      })
      .addCase(initiateRegister.fulfilled, (state, action) => {
        state.registerStatus = 'succeeded';
        state.registerData = action.meta.arg; // Lưu dữ liệu đăng ký tạm thời
      })
      .addCase(initiateRegister.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(verifyRegister.pending, (state) => {
        state.verifyStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyRegister.fulfilled, (state) => {
        state.verifyStatus = 'succeeded';
        state.registerData = null; // Xóa dữ liệu tạm sau khi xác minh thành công
      })
      .addCase(verifyRegister.rejected, (state, action) => {
        state.verifyStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(resendOtp.pending, (state) => {
        state.verifyStatus = 'loading';
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.verifyStatus = 'succeeded';
        state.error = null; // Xóa lỗi nếu có
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.verifyStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthState } = registerSlice.actions;
export default registerSlice.reducer;