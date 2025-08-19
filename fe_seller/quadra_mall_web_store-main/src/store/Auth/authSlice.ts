import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { LoginRequest } from '@/types/Auth/base/Request/loginRequest';
import type { LoginResponse } from '@/types/Auth/base/Response/loginResponse';
import type { AuthState } from '@/types/Auth/sates/AuthState';
import type { User } from '@/types/User';
import { AxiosError } from 'axios';
import { api } from '@/main';

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  storeIds: localStorage.getItem('storeIds') ? JSON.parse(localStorage.getItem('storeIds')!) : [],
  storeId: localStorage.getItem('selectedStoreId') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

export const loginUser = createAsyncThunk<
    LoginResponse,
    { email: string; password: string },
    { rejectValue: string }
>('auth/login', async (payload: LoginRequest, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', payload);
    console.log('login: ', res.data);
    return res.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
    return rejectWithValue('Đăng nhập thất bại do lỗi không xác định');
  }
});

export const oauth2Login = createAsyncThunk<LoginResponse, string, { rejectValue: string }>(
    'auth/oauth2Login',
    async (token: string, { rejectWithValue }) => {
      try {
        const res = await api.get('/auth/OAuth2-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('oauth2 login: ', res.data);
        return res.data as LoginResponse;
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          return rejectWithValue(err.response?.data?.message || 'Đăng nhập Google thất bại');
        }
        return rejectWithValue('Đăng nhập Google thất bại do lỗi không xác định');
      }
    }
);

export const verifyToken = createAsyncThunk<LoginResponse, string, { rejectValue: string }>(
    'auth/verifyToken',
    async (token: string, { rejectWithValue }) => {
      try {
        const res = await api.get('/auth/verify-token', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('verify token: ', res.data);
        return res.data as LoginResponse;
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          return rejectWithValue(err.response?.data?.message || 'Xác thực token thất bại');
        }
        return rejectWithValue('Xác thực token thất bại do lỗi không xác định');
      }
    }
);

export const refreshToken = createAsyncThunk<LoginResponse, string, { rejectValue: string }>(
    'auth/refreshToken',
    async (refreshToken, { rejectWithValue }) => {
      try {
        const res = await api.post('/auth/refresh', { refreshToken });
        return res.data;
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          return rejectWithValue(err.response?.data?.message || 'Làm mới token thất bại!');
        }
        return rejectWithValue('Làm mới token thất bại do lỗi không xác định');
      }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('storeIds');
      localStorage.removeItem('selectedStoreId');
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.storeIds = [];
      state.storeId = null;
      state.error = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.token = localStorage.getItem('token') || null;
      state.refreshToken = localStorage.getItem('refreshToken') || null;
      state.isAuthenticated = !!state.token;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    setSelectedStoreId: (state, action: PayloadAction<string | null>) => {
      state.storeId = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedStoreId', action.payload);
      } else {
        localStorage.removeItem('selectedStoreId');
      }
    },
  },
  extraReducers: (builder) => {
    const handleLoginFulfilled = (state: AuthState, action: PayloadAction<LoginResponse>) => {
      state.loading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = {
        email: action.payload.email,
        provider: action.payload.provider,
        fullName: action.payload.fullName,
        phoneNumber: action.payload.phoneNumber || '',
        avatarUrl: action.payload.avatarUrl || '',
        roles: action.payload.roles,
      };
      state.isAuthenticated = true;
      state.storeIds = action.payload.storeIds || [];
  localStorage.setItem('user', JSON.stringify(state.user));
  localStorage.setItem('token', action.payload.token);
  localStorage.setItem('refreshToken', action.payload.refreshToken);
  localStorage.setItem('userId', String(action.payload.userId));

      // Check if user has SELLER role and no stores
      const hasSellerRole = action.payload.roles.some((role) => role.name === 'SELLER');
      if (hasSellerRole && (!action.payload.storeIds || action.payload.storeIds.length === 0)) {
        state.error = 'Người dùng chưa có cửa hàng nào. Vui lòng đăng ký cửa hàng.';
      } else {
        state.error = null;
      }

      if (action.payload.storeIds && action.payload.storeIds.length > 0) {
        localStorage.setItem('storeIds', JSON.stringify(action.payload.storeIds));
        const selectedStoreId = localStorage.getItem('selectedStoreId');
        if (!selectedStoreId || !action.payload.storeIds.includes(Number(selectedStoreId))) {
          state.storeId = null; // Yêu cầu chọn cửa hàng nếu chưa có hoặc không hợp lệ
        } else {
          state.storeId = selectedStoreId; // Giữ storeId nếu đã chọn và hợp lệ
        }
      } else {
        localStorage.removeItem('storeIds');
        state.storeId = null;
      }
    };

    builder
        .addCase(loginUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(loginUser.fulfilled, handleLoginFulfilled)
        .addCase(loginUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
          state.storeIds = [];
          state.storeId = null;
        })
        .addCase(oauth2Login.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(oauth2Login.fulfilled, handleLoginFulfilled)
        .addCase(oauth2Login.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
          state.storeIds = [];
          state.storeId = null;
        })
        .addCase(verifyToken.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(verifyToken.fulfilled, handleLoginFulfilled)
        .addCase(verifyToken.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.storeIds = [];
          state.storeId = null;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('storeIds');
          localStorage.removeItem('selectedStoreId');
        })
        .addCase(refreshToken.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(refreshToken.fulfilled, handleLoginFulfilled)
        .addCase(refreshToken.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.storeIds = [];
          state.storeId = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('storeIds');
          localStorage.removeItem('selectedStoreId');
        });
  },
});

export const { logout, setUser, setSelectedStoreId } = authSlice.actions;
export default authSlice.reducer;