
// import { DiscountDTO, ProductDTO } from '@/store/Discount/discountSlice';
// import axios from 'axios';



// // Tạo API instance đơn giản mà không phụ thuộc vào store
// const api = axios.create({
//   baseURL: 'http://localhost:8080',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// // Request DTO cho tạo/cập nhật voucher
// export interface VoucherCreateRequest {
//   code: string;
//   title: string;
//   description: string;
//   discountType: 'PERCENTAGE' | 'FIXED';
//   discountValue: number;
//   maxDiscountValue: number;
//   maxUses: number;
//   storeId: number;
//   notificationMessage: string;
//   startDate: string; // LocalDate format: YYYY-MM-DD
//   endDate: string;   // LocalDate format: YYYY-MM-DD
//   isActive: boolean;
//   productIds: number[];
//   minOrderAmount: number; // Điều kiện áp dụng
// }

// export const voucherService = {
//   // Lấy danh sách voucher chi tiết của store (DiscountDTO) - cho admin management
//   getStoreVouchers(storeId: number) {
//     return api.get<DiscountDTO[]>(`/api/vouchers/store/${storeId}`);
//   },

//   // Lấy danh sách sản phẩm của store theo API endpoint
//   getStoreProducts(storeId: number) {
//     // Sử dụng API thật thay vì mock data
//     return api.get<ProductDTO[]>(`/seller/products/${storeId}`);
    
//     // Mock data để fallback nếu API lỗi (comment lại khi API hoạt động ổn định)
//     // console.log('Fetching products for store:', storeId);
//     // return Promise.resolve({ data: mockProducts });
//   },

//   // Lấy chi tiết voucher theo ID
//   getVoucherDetail(voucherId: number, userId: number) {
//     return api.get<DiscountDTO>(`/api/vouchers/detail/${voucherId}?userId=${userId}`);
//   },

//   // Tạo mới voucher
//   createVoucher(data: VoucherCreateRequest) {
//     return api.post<DiscountDTO>('/api/vouchers', data);
//   },

//   // Cập nhật voucher
//   updateVoucher(id: number, data: VoucherCreateRequest) {
//     return api.put<DiscountDTO>(`/api/vouchers/${id}`, data);
//   },

//   // Cập nhật trạng thái voucher
//   updateVoucherStatus(id: number, isActive: boolean) {
//     return api.patch<string>(`/api/vouchers/${id}/status`, { isActive });
//   },

//   // Xóa voucher
//   deleteVoucher(id: number) {
//     return api.delete<void>(`/api/vouchers/${id}`);
//   }
// };
