// src/services/apiClient.ts (hoặc path tương ứng)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request: Tự động thêm token nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: Xử lý lỗi auth (ví dụ: 401 -> logout/refresh)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý unauthorized: Xóa token và redirect login (tùy ứng dụng)
      localStorage.removeItem('access_token');
      // Ví dụ: window.location.href = '/login'; // Hoặc dùng router nếu có
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
