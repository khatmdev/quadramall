import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { setUser, logout } from '@/store/Auth/authSlice';
import type { RootState } from '@/store';
import { configureStore } from '@reduxjs/toolkit';

// Các endpoint không yêu cầu xác thực
const PUBLIC_ENDPOINTS = [
  '/products',
  '/products/',
  '/products/*',
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
];

// Hàm tạo instance Axios với store được truyền vào
export const createApi = (store: ReturnType<typeof configureStore>) => {
  const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const state: RootState = store.getState();
    const token = state.auth.token;
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.startsWith(endpoint.replace('*', ''))
    );

    if (token && !isPublicEndpoint) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const state: RootState = store.getState();
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        state.auth.refreshToken
      ) {
        originalRequest._retry = true;
        try {
          const res = await api.post('/auth/refresh', {
            refreshToken: state.auth.refreshToken,
          });
          const newAccessToken = res.data.accessToken;

          localStorage.setItem('token', newAccessToken);
          store.dispatch(
            setUser({
              ...state.auth.user,
              token: newAccessToken,
            })
          );

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          console.error('Refresh token failed:', refreshErr);
          store.dispatch(logout());
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};
