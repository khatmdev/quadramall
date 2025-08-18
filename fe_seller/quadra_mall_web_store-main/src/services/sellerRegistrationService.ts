// src/services/sellerRegistrationService.ts
import { AxiosInstance } from 'axios';
import {
    SellerRegistrationRequest,
    SellerRegistrationResponse,
    RegistrationUpdateRequest,
    RegistrationDetails,
    ApiResponse
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
                return response.data.data;
            } catch (error: any) {
                if (error.response?.status === 404) {
                    return null; // User chưa có đăng ký nào
                }
                console.error('Lỗi khi lấy trạng thái đăng ký:', error);
                throw error;
            }
        },
    };
};