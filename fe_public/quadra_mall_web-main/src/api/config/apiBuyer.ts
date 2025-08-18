// src/api/apiBuyer.ts
import axios from 'axios';

const apiBuyer = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/buyer`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token nếu có (yêu cầu đã đăng nhập)
apiBuyer.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiBuyer;
