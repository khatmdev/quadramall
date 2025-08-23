// src/services/uploadService.ts
import type { ApiResponse } from '@/types/api';
import axios from 'axios';

const media_url = axios.create({
  baseURL: import.meta.env.VITE_API_MEDIA_URL,
});

export const uploadImage = async (file: File | Blob): Promise<ApiResponse<string>> => {
  // Kiểm tra token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
  }

  const formData = new FormData();
  formData.append('file', file, 'banner.jpg'); // Đặt tên file nếu là Blob

  try {
    const { data: url } = await axios.post<string>(`${media_url}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    // Wrap kết quả thành ApiResponse đầy đủ khi success
    return {
      status: 'success',
      message: 'Upload thành công',
      timestamp: new Date().toISOString(),
      data: url,
    };
  } catch (error) {
    let message = 'Upload thất bại';
    let errorCode: string | undefined = undefined;
    let status: 'fail' | 'error' = 'error';

    if (axios.isAxiosError(error) && error.response) {
      status = error.response.status >= 500 ? 'error' : 'fail';
      message = typeof error.response.data === 'string' ? error.response.data : message;
      errorCode = error.response.status.toString(); // Hoặc lấy từ body nếu có
    }

    // Trả về ApiResponse cho error để useApiMutation xử lý
    const errorResponse: ApiResponse<string> = {
      status,
      message,
      timestamp: new Date().toISOString(),
      data: null as any, // data là T, nhưng ở đây null
      errorCode,
    };

    throw errorResponse; // Throw để mutationFn throw, kích hoạt onError
  }
};