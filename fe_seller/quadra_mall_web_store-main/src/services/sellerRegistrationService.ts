// src/services/sellerRegistrationService.ts
import { AxiosInstance } from 'axios';
import {
    SellerRegistrationRequest,
    SellerRegistrationResponse,
    RegistrationUpdateRequest,
    RegistrationDetails,
    ApiResponse, StoreInfoDto
} from '@/types/sellerRegistration';

export const sellerRegistrationApi = (api: AxiosInstance) => {
    return {
        // Hàm gọi API đăng ký cửa hàng
        registerStore: async (request: SellerRegistrationRequest): Promise<SellerRegistrationResponse> => {
            try {
                const response = await api.post<ApiResponse<SellerRegistrationResponse>>('/seller-registrations', request);
                return response.data.data;
            } catch (error) {
                console.error('Lỗi khi đăng ký cửa hàng:', error);
                throw error;
            }
        },

        // Hàm lấy chi tiết đăng ký để chỉnh sửa (khi REJECTED)
        getRegistrationDetails: async (id: number): Promise<RegistrationDetails> => {
            try {
                const response = await api.get<ApiResponse<RegistrationDetails>>(`/seller-registrations/${id}`);
                return response.data.data;
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết đăng ký:', error);
                throw error;
            }
        },

        // Hàm cập nhật đăng ký (khi REJECTED)
        updateRegistration: async (id: number, request: RegistrationUpdateRequest): Promise<SellerRegistrationResponse> => {
            try {
                const response = await api.put<ApiResponse<SellerRegistrationResponse>>(`/seller-registrations/${id}`, request);
                return response.data.data;
            } catch (error) {
                console.error('Lỗi khi cập nhật đăng ký:', error);
                throw error;
            }
        },

        // Hàm hủy đăng ký
        cancelRegistration: async (id: number): Promise<void> => {
            try {
                await api.delete<ApiResponse<void>>(`/seller-registrations/${id}`);
            } catch (error) {
                console.error('Lỗi khi hủy đăng ký:', error);
                throw error;
            }
        },

        // Hàm lấy trạng thái đăng ký của user hiện tại
        getCurrentUserRegistration: async (): Promise<RegistrationDetails | null> => {
            try {
                const response = await api.get<ApiResponse<RegistrationDetails>>('/seller-registrations/current-user');

                // Kiểm tra nếu data null (user chưa có đăng ký)
                if (!response.data.data) {
                    return null;
                }

                return response.data.data;
            } catch (error: any) {
                // Không cần xử lý 400/404 như lỗi nữa
                // Chỉ log và trả về null
                console.log('User chưa có đăng ký nào:', error.response?.data?.message || error.message);
                return null;
            }
        },

        // Hàm lấy danh sách stores của user hiện tại
        getCurrentUserStores: async (): Promise<StoreInfoDto[]> => {
            try {
                const response = await api.get<ApiResponse<StoreInfoDto[]>>('/seller/user-store/stores');
                return response.data.data;
            } catch (error) {
                console.error('Lỗi khi lấy danh sách cửa hàng:', error);
                throw error;
            }
        },
    };
};