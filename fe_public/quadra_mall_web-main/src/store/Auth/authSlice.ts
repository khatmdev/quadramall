import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LoginRequest } from '@/types/Auth/base/Request/loginRequest';
import type { LoginResponse } from '@/types/Auth/base/Response/loginResponse';
import type { RegisterResponse } from '@/types/Auth/base/Response/registerResponse';
import type { AuthState } from '@/types/Auth/sates/AuthState';
import { RegisterRequest } from '@/types/Auth/base/Request/registerRequest';
import { AxiosError } from 'axios'; 
import { api } from '@/main';

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'), // Thêm isAuthenticated dựa trên token
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

// ✅ Thêm action refreshMe để cập nhật thông tin user mới nhất
export const refreshMe = createAsyncThunk<LoginResponse, void, { rejectValue: string }>(
  'auth/refreshMe',
  async (_, { rejectWithValue }) => {
    try {
      logout()
      const res = await api.post('/auth/refreshMe');
      console.log('refresh me: ', res.data);
      return res.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        return rejectWithValue(err.response?.data?.message || 'Cập nhật thông tin thất bại');
      }
      return rejectWithValue('Cập nhật thông tin thất bại do lỗi không xác định');
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
      state.isAuthenticated = false; // Đặt isAuthenticated thành false khi logout
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = localStorage.getItem('token') || null;
      state.refreshToken = localStorage.getItem('refreshToken') || null;
      state.isAuthenticated = !!state.token; // Cập nhật isAuthenticated dựa trên token
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          provider: action.payload.provider,
          fullName: action.payload.fullName,
          phoneNumber: action.payload.phoneNumber || '',
          avatarUrl: action.payload.avatarUrl || '',
          roles: action.payload.roles,
        };
        state.isAuthenticated = true; // Đặt isAuthenticated thành true khi login thành công
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false; // Đặt isAuthenticated thành false khi login thất bại
      })
      .addCase(oauth2Login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(oauth2Login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          provider: action.payload.provider,
          fullName: action.payload.fullName,
          phoneNumber: action.payload.phoneNumber || '',
          avatarUrl: action.payload.avatarUrl || '',
          roles: action.payload.roles,
        };
        state.isAuthenticated = true; // Đặt isAuthenticated thành true khi oauth2 login thành công
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(oauth2Login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false; // Đặt isAuthenticated thành false khi oauth2 login thất bại
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          provider: action.payload.provider,
          fullName: action.payload.fullName,
          phoneNumber: action.payload.phoneNumber || '',
          avatarUrl: action.payload.avatarUrl || '',
          roles: action.payload.roles,
        };
        state.isAuthenticated = true; // Đặt isAuthenticated thành true khi refresh token thành công
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false; // Đặt isAuthenticated thành false khi refresh token thất bại
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      // ✅ Thêm cases cho refreshMe
      .addCase(refreshMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshMe.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật thông tin user mới nhất từ backend
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          provider: action.payload.provider,
          fullName: action.payload.fullName,
          phoneNumber: action.payload.phoneNumber || '',
          avatarUrl: action.payload.avatarUrl || '',
          roles: action.payload.roles, // ✅ Roles mới nhất từ backend
        };
        // Cập nhật localStorage với thông tin mới
        localStorage.setItem('user', JSON.stringify(state.user));
        state.error = null;
      })
      .addCase(refreshMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;