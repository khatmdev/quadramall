
import { api } from '@/main';
import type { LoginResponse } from '@/types/profile';

export const getProfile = async (): Promise<LoginResponse> => {
  const response = await api.get<LoginResponse>('/profile');
  return response.data;
};

export const updateProfile = async (formData: FormData) => {
  const response = await api.post('/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
