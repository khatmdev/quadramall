import { createApi } from '@/services/axios';
import type { AxiosInstance } from 'axios';
import type {RejectSellerRegistrationRequest, SellerRegistration} from '@/types/sellerRegistration';

// Service để gọi API liên quan đến yêu cầu đăng ký cửa hàng
export class SellerRegistrationService {
    private api: AxiosInstance;

    constructor() {
        console.log('Khởi tạo SellerRegistrationService');
        this.api = createApi();
    }

    // Lấy danh sách yêu cầu đăng ký cửa hàng, có thể lọc theo trạng thái
    async getAllRegistrations(status?: string): Promise<SellerRegistration[]> {
        console.log('Gọi API lấy danh sách yêu cầu đăng ký, trạng thái:', status);
        try {
            const response = await this.api.get('/admin/seller-registrations', {
                params: { status },
            });
            console.log('Phản hồi từ API getAllRegistrations:', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu cầu đăng ký:', error);
            throw error;
        }
    }

    // Phê duyệt yêu cầu đăng ký cửa hàng
    async approveRegistration(shopId: number): Promise<SellerRegistration> {
        console.log('Gọi API phê duyệt yêu cầu đăng ký, shopId:', shopId);
        try {
            const response = await this.api.patch(`/admin/seller-registrations/${shopId}/approve`);
            console.log('Phản hồi từ API approveRegistration:', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Lỗi khi phê duyệt yêu cầu đăng ký:', error);
            throw error;
        }
    }

    // Từ chối yêu cầu đăng ký cửa hàng
    async rejectRegistration(id: number, request: RejectSellerRegistrationRequest): Promise<SellerRegistration> {
        try {
            const response = await this.api.patch(`/admin/seller-registrations/${id}/reject`, request);
            return response.data.data;
        } catch (error) {
            console.error('Lỗi khi từ chối yêu cầu đăng ký:', error);
            throw error;
        }
    }
}

export const sellerRegistrationService = new SellerRegistrationService();