// src/types/api.ts
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  timestamp: string;
  data: T;
  errorCode?: string;
}