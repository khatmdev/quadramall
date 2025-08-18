import { api } from '@/main'; // Sử dụng api từ main.tsx
import {Page, ProductDto, ShopDetailDto, StoreFavoriteRequestDto} from '@/types/store_detail/interfaces';

export const storeService = {
  async getStoreBySlug(storeSlug: string): Promise<ShopDetailDto> {
    try {
      const response = await api.get(`/public/stores/${storeSlug}`); // Sử dụng /public/stores
      return response.data.data; // Assuming ApiResponse wrapper with 'data' property
    } catch (error) {
      throw new Error(`Failed to fetch store details: ${error}`);
    }
  },

  async getStoreProducts(
      storeSlug: string,
      params: {
        categoryId?: number;
        sort?: 'comprehensive' | 'best_selling' | 'newest' | 'price_asc' | 'price_desc';
        page?: number;
        size?: number;
        userId?: number;
      }
  ): Promise<Page<ProductDto>> {
    try {
      const response = await api.get(`/public/stores/${storeSlug}/products`, {
        params: {
          categoryId: params.categoryId,
          sort: params.sort || 'comprehensive',
          page: params.page || 0,
          size: params.size || 20,
          userId: params.userId,
        },
      });
      return response.data.data; // Assuming ApiResponse wrapper with 'data' property
    } catch (error) {
      throw new Error(`Failed to fetch store products: ${error}`);
    }
  },

  async addStoreFavorite(favoriteDto: StoreFavoriteRequestDto): Promise<string> {
    try {
      const response = await api.post(`/public/stores/favorite`, favoriteDto);
      if (response.data.status === 'success') {
        return response.data.message; // Trả về thông điệp: "Đã thêm..."
      } else {
        throw new Error(response.data.message || 'Không thể thêm cửa hàng vào danh sách yêu thích');
      }
    } catch (error) {
      throw new Error(`Failed to add store favorite: ${error}`);
    }
  },

  async removeStoreFavorite(storeId: number): Promise<string> {
    try {
      const response = await api.delete(`/public/stores/favorite/${storeId}`);
      if (response.data.status === 'success') {
        return response.data.message; // Trả về thông điệp: "Đã xóa..."
      } else {
        throw new Error(response.data.message || 'Không thể xóa cửa hàng khỏi danh sách yêu thích');
      }
    } catch (error) {
      throw new Error(`Failed to remove store favorite: ${error}`);
    }
  },
};
