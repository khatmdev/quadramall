// @/hooks/useApiResponse.ts

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: number;
}

interface ApiError {
  response?: {
    data?: ApiResponse<any>;
  };
  message?: string;
}

export const useApiResponse = () => {
  const handleSuccess = useCallback(<T>(response: ApiResponse<T>, customMessage?: string) => {
    const message = customMessage || response.message || 'Thành công';
    toast.success(message);
    return response.data;
  }, []);

  const handleError = useCallback((error: ApiError, defaultMessage?: string) => {
    let errorMessage = defaultMessage || 'Có lỗi xảy ra';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errorCode) {
      errorMessage = `Lỗi ${error.response.data.errorCode}: ${error.response.data.message || 'Có lỗi xảy ra'}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }, []);

  const extractData = useCallback(<T>(response: ApiResponse<T>): T => {
    return response.data;
  }, []);

  const extractMessage = useCallback(<T>(response: ApiResponse<T>): string => {
    return response.message || 'Thành công';
  }, []);

  const isSuccess = useCallback(<T>(response: ApiResponse<T>): boolean => {
    return response.status === 'success';
  }, []);

  const showSuccessToast = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showErrorToast = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showInfoToast = useCallback((message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  }, []);

  const showWarningToast = useCallback((message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#FEF3CD',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
    });
  }, []);

  return {
    handleSuccess,
    handleError,
    extractData,
    extractMessage,
    isSuccess,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
};

export default useApiResponse;