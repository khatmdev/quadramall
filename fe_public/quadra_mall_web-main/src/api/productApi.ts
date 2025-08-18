import { api } from '@/main';
import { ProductDetailDTO } from '@/types/product/product_Detail';
import {ApiResponse} from "@/types/api"; // Import interface ProductDetailDTO

// Hàm fetch chi tiết sản phẩm theo slug
export const fetchProductDetail = async (slug: string): Promise<ProductDetailDTO> => {
  try {
    // Lấy token từ localStorage (hoặc từ store tùy theo cách bạn lưu token)
    const token = localStorage.getItem('token'); // Thay bằng cách lấy token của bạn

    const response = await api.get<ApiResponse<ProductDetailDTO>>(`/products/${slug}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data.data; // Trả về ProductDetailDTO từ ApiResponse
    } else {
      throw new Error('Không thể tải thông tin sản phẩm');
    }
  } catch (error) {
    const err = error as Error;
    throw new Error('Không thể tải thông tin sản phẩm: ' + err.message);
  }
};
