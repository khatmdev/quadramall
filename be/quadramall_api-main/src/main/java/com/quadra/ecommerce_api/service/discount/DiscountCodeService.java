package com.quadra.ecommerce_api.service.discount;


import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.discount.request.ApplyDiscountRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.CreateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.UpdateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCalculationResponse;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCodeListResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DiscountCodeService {

    // ===== CRUD OPERATIONS =====

    /**
     * Tạo mã giảm giá mới
     */
    DiscountCodeDTO createDiscountCode(CreateDiscountCodeRequest request, Long createdBy);

    /**
     * Cập nhật mã giảm giá
     */
    DiscountCodeDTO updateDiscountCode(Long discountCodeId, UpdateDiscountCodeRequest request, Long updatedBy);

    /**
     * Lấy thông tin mã giảm giá theo ID
     */
    DiscountCodeDTO getDiscountCodeById(Long discountCodeId);

    /**
     * Lấy danh sách mã giảm giá theo store với phân trang
     */
    DiscountCodeListResponse getDiscountCodesByStore(Long storeId, Pageable pageable);

    /**
     * Tìm kiếm mã giảm giá
     */
    DiscountCodeListResponse searchDiscountCodes(Long storeId, String keyword, Pageable pageable);

    /**
     * Xóa mã giảm giá (soft delete)
     */
    void deleteDiscountCode(Long discountCodeId, Long deletedBy);

    /**
     * Kích hoạt/vô hiệu hóa mã giảm giá
     */
    void toggleDiscountCodeStatus(Long discountCodeId, Boolean isActive, Long updatedBy);

    // ===== BUSINESS OPERATIONS =====

    /**
     * Lấy danh sách mã giảm giá có thể áp dụng cho đơn hàng với context product IDs
     * Method này sẽ trả về đầy đủ thông tin product IDs mà voucher áp dụng
     */
    List<DiscountCodeDTO> getApplicableDiscountCodesWithContext(Long storeId, List<Long> productIds, Long userId);

    /**
     * Tính toán chi tiết giảm giá cho từng sản phẩm
     */
    DiscountCalculationResponse calculateDiscountDetails(ApplyDiscountRequest request);

    /**
     * Áp dụng mã giảm giá cho đơn hàng
     */
    DiscountCalculationResponse applyDiscountCode(ApplyDiscountRequest request);

    /**
     * Lấy danh sách mã giảm giá có thể áp dụng cho đơn hàng
     */
    List<DiscountCodeDTO> getApplicableDiscountCodes(Long storeId, List<Long> productIds, Long userId);

    /**
     * Tự động áp dụng mã giảm giá tốt nhất
     */
    DiscountCalculationResponse getAutoBestDiscount(Long storeId, List<Long> productIds,
                                                    Long userId, java.math.BigDecimal orderAmount);

    /**
     * Xác nhận sử dụng mã giảm giá (khi đặt hàng thành công)
     */
    void confirmDiscountUsage(String discountCode, Long userId, Long orderId,
                              java.math.BigDecimal discountAmount, java.math.BigDecimal originalAmount);

    // ===== VALIDATION METHODS =====

    /**
     * Kiểm tra mã giảm giá có hợp lệ không
     */
    boolean isDiscountCodeValid(String discountCode, Long storeId, List<Long> productIds, Long userId);

    /**
     * Kiểm tra mã giảm giá có thể sử dụng không
     */
    String checkDiscountCodeUsability(String discountCode, Long storeId, List<Long> productIds,
                                      Long userId, java.math.BigDecimal orderAmount);
}