import { createApi } from './axios'; // Import Axios instance từ code gốc
import type { SellerFlashSaleProductDTO, CreateFlashSaleDTO, UpdateFlashSaleDTO, ProductSellerDTO } from '@/types/flashSale'; // Cập nhật types dựa trên BE mới (đổi Variant thành Product, và sử dụng ProductSellerDTO cho products)

// Tạo api instance
const api = createApi();

// Helper private để build base URL với storeId (gộp logic chung)
const _getBaseUrl = (endpoint: string = ''): string => {
  const selectedStoreId = localStorage.getItem('selectedStoreId');
  if (!selectedStoreId) {
    throw new Error('No selected store ID found');
  }
  return `/api/seller/${selectedStoreId}/flashsales${endpoint}`;
};

// Lấy list flash sales cho seller
export const getFlashSales = async (page: number = 0, size: number = 10): Promise<SellerFlashSaleProductDTO[]> => {
  try {
    const url = `${_getBaseUrl()}?page=${page}&size=${size}`;
    const response = await api.get(url);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to fetch flash sales');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    throw error;
  }
};

// Tạo flash sale
export const createFlashSale = async (data: CreateFlashSaleDTO): Promise<SellerFlashSaleProductDTO> => {
  try {
    const url = _getBaseUrl();
    const response = await api.post(url, data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to create flash sale');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error creating flash sale:', error);
    throw error;
  }
};

// Update flash sale
export const updateFlashSale = async (id: number, data: UpdateFlashSaleDTO): Promise<SellerFlashSaleProductDTO> => {
  try {
    const url = `${_getBaseUrl()}/${id}`;
    const response = await api.put(url, data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to update flash sale');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error updating flash sale:', error);
    throw error;
  }
};

// Delete flash sale
export const deleteFlashSale = async (id: number): Promise<void> => {
  try {
    const url = `${_getBaseUrl()}/${id}`;
    const response = await api.delete(url);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to delete flash sale');
    }
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    throw error;
  }
};

// Lấy list products available cho create/update flash sale (thay thế cho getVariantsByProductId, vì BE giờ dùng product thay vì variant)
export const getProductsForStore = async (page: number = 0, size: number = 10, searchQuery: string = ''): Promise<{ data: ProductSellerDTO[], total: number }> => {
  const selectedStoreId = localStorage.getItem('selectedStoreId');
  if (!selectedStoreId) {
    throw new Error('No selected store ID found');
  }
  try {
    const url = `/api/seller/${selectedStoreId}/flashsales/products?page=${page}&size=${size}${searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ''}`;
    const response = await api.get(url);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to fetch products');
    }
    return { data: response.data.data.content, total: response.data.data.totalElements }; // Assume BE returns Page with content/totalElements
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};