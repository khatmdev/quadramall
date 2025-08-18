import apiClient from '@/api/config/apiClient'; // Điều chỉnh path nếu cần
import type { ApiResponse } from '@/types/api';
import type { BannerDTO } from '@/types/home/banner'; // Giả sử bạn có type BannerDTO
import type { ProductCardDTO } from '@/types/home/product';
import type { StoreHomeResponseDTO } from '@/types/home/store';
import type { ItemTypeDTO } from '@/types/home/itemType';
import { FlashSaleProductDTO } from '@/types/home/flashSale';

export const getActiveBanners = async (): Promise<ApiResponse<BannerDTO[]>> => {
  const response = await apiClient.get('/banners');
  return response.data; 
};

export const getIntroBanner = async (): Promise<ApiResponse<BannerDTO>> => {
  const response = await apiClient.get('/intro');
  return response.data; 
};


export const getItemTypes = async (): Promise<ApiResponse<ItemTypeDTO[]>> => {
  const response = await apiClient.get('/item-types');
  return response.data;
};


export const getStores = async (): Promise<ApiResponse<StoreHomeResponseDTO[]>> => {
  const response = await apiClient.get('/stores');
  return response.data;
};

export const getHomeProducts = async (
  page = 0,
  size = 10
): Promise<ApiResponse<ProductCardDTO[]>> => {
  const response = await apiClient.get('/products', {
    params: { page, size },
  });
  return response.data;
};

// Lấy danh sách sản phẩm flash sale
export const getFlashSaleProducts = async (
  page = 0,
  size = 10
): Promise<ApiResponse<{ content: FlashSaleProductDTO[]; totalElements: number; }>> => {  // Type mới để khớp Page
  const response = await apiClient.get('/flash-sales', {
    params: { page, size },
  });
  return response.data;  // Trả về toàn bộ ApiResponse<Page>
};