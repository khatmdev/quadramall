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
    console.log('API response:', res.data); // Debug dữ liệu API
    return res.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.log('API error:', err.response?.data); // Debug lỗi API
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
        console.log('oauth2 login:', res.data);
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
        console.log('verify token:', res.data);
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
      state.user = null;
      state.token = null;
      state.refreshToken = null;
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
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);

      // Kiểm tra vai trò ROLE_ADMIN
      const hasAdminRole = action.payload.roles.some((role) => role.name === 'ROLE_ADMIN');
      if (!hasAdminRole) {
        state.error = 'Tài khoản không có quyền admin';
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } else {
        state.error = null;
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
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
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
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;