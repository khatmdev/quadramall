// bannerService.ts
import apiClient from '@/api/config/apiClient';
import type { Banner } from '@/types/banner';
import type { ApiResponse } from '@/types/api';

export const bannerService = {
  getAll: (): Promise<ApiResponse<Banner[]>> =>
    apiClient.get('/banners').then(res => res.data),

  getById: (id: number): Promise<ApiResponse<Banner>> =>
    apiClient.get(`/banners/${id}`).then(res => res.data),

  create: (data: Partial<Banner>): Promise<ApiResponse<Banner>> =>
    apiClient.post('/banners', data).then(res => res.data),

  update: (id: number, data: Partial<Banner>): Promise<ApiResponse<Banner>> =>
    apiClient.put(`/banners/${id}`, data).then(res => res.data),

  remove: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/banners/${id}`).then(res => res.data),

  toggleActive: (id: number): Promise<ApiResponse<Banner>> =>
    apiClient.patch(`/banners/${id}/toggle-active`).then(res => res.data),

  makeIntro: (id: number): Promise<ApiResponse<Banner>> =>
    apiClient.patch(`/banners/${id}/make-intro`).then(res => res.data),

  reorder: (orders: { id: number; displayOrder: number }[]): Promise<ApiResponse<void>> =>
    apiClient.put('/banners/reorder', orders).then(res => res.data)
};
