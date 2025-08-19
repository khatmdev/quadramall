import axios, { type AxiosInstance } from 'axios';
import { setUser, logout } from '@/store/Auth/authSlice';
import type { RootState } from '@/store';
import { getStore } from '@/store';

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
export const createApi = () => {
  const store = getStore();
  const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const state: RootState = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
        config.url?.startsWith(endpoint.replace('*', ''))
    );

    if (token && !isPublicEndpoint) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header for', config.url, ':', `Bearer ${token}`);
    } else if (!token && !isPublicEndpoint) {
      console.warn('No token found for non-public endpoint:', config.url);
    }
    return config;
  });

  api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const state: RootState = store.getState();
        const refreshToken = state.auth?.refreshToken || localStorage.getItem('refreshToken');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
          originalRequest._retry = true;
          try {
            console.log('Attempting to refresh token with refreshToken:', refreshToken);
            const res = await api.post('/auth/refresh', { refreshToken });
            const newAccessToken = res.data.token;

            console.log('New access token received:', newAccessToken);
            localStorage.setItem('token', newAccessToken);
            store.dispatch(
                setUser({
                  ...state.auth?.user,
                  token: newAccessToken,
                })
            );

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            console.log('Retrying request with new token:', originalRequest.url);
            return api(originalRequest);
          } catch (refreshErr) {
            console.error('Refresh token failed:', refreshErr);
            store.dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshErr);
          }
        } else if (error.response?.status === 401 && !refreshToken) {
          console.error('No refresh token available, redirecting to login');
          store.dispatch(logout());
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        console.error('API error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
  );

  return api;
};

export { axios };
