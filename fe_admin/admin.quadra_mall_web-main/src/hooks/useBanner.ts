// src/hooks/useBanner.ts
import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { bannerService } from '@/api/banner/bannerService';

export const useBanners = () =>
  useApiQuery({
    queryKey: ['banners'],
    queryFn: bannerService.getAll,
  });

export const useBanner = (id: number) => {
  return useApiQuery({
    queryKey: ['banners', id],
    queryFn: () => bannerService.getById(id),
    enabled: !!id, // Chỉ gọi nếu có id
  });
};


export const useCreateBanner = () =>
  useApiMutation({
    mutationFn: bannerService.create,
    onSuccessMessage: 'Tạo banner thành công',
    invalidateQueryKey: ['banners'],
  });

export const useUpdateBanner = () =>
  useApiMutation({
    mutationFn: ({ id, data }) => bannerService.update(id, data),
    onSuccessMessage: 'Cập nhật thành công',
    invalidateQueryKey: ['banners'],
  });

export const useDeleteBanner = () =>
  useApiMutation({
    mutationFn: bannerService.remove,
    onSuccessMessage: 'Đã xoá banner',
    invalidateQueryKey: ['banners'],
  });

export const useToggleBannerActive = () =>
  useApiMutation({
    mutationFn: bannerService.toggleActive,
    onSuccessMessage: 'Đã đổi trạng thái hiển thị',
    invalidateQueryKey: ['banners'],
  });

export const useMakeIntroBanner = () =>
  useApiMutation({
    mutationFn: bannerService.makeIntro,
    onSuccessMessage: 'Đã đặt banner làm giới thiệu',
    invalidateQueryKey: ['banners'],
  });

export const useReorderBanners = () =>
  useApiMutation({
    mutationFn: bannerService.reorder,
    onSuccessMessage: 'Cập nhật thứ tự banner thành công',
    invalidateQueryKey: ['banners'],
  });

