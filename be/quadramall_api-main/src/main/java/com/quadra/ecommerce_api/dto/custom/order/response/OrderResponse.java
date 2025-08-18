package com.quadra.ecommerce_api.dto.custom.order.response;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Chi tiết đơn hàng")
public class OrderResponse {
    @Schema(description = "Mã định danh duy nhất của đơn hàng", example = "1")
    private Long id;

    @Schema(description = "Thông tin cửa hàng")
    private OrderStoreResponse store;

    @Schema(description = "Trạng thái hiện tại của đơn hàng", example = "PENDING")
    private OrderStatus status;

    @Schema(description = "Phương thức vận chuyển", example = "STANDARD")
    private ShippingMethod shippingMethod;

    @Schema(description = "Phương thức thanh toán", example = "CREDIT_CARD")
    private PaymentMethod paymentMethod;

    @Schema(description = "Danh sách mã giảm giá đã áp dụng")
    private List<DiscountCodeDTO> discountCodes;

    @Schema(description = "Chi phí vận chuyển")
    private BigDecimal ShippingCost;

    @Schema(description = "Tổng số tiền phải trả cho đơn hàng", example = "200.00")
    private BigDecimal totalAmount;

    @Schema(description = "Ghi chú bổ sung cho đơn hàng", example = "Giao hàng vào buổi sáng")
    private String note;

    @Schema(description = "Thời điểm tạo đơn hàng", example = "2023-01-01T00:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời điểm cập nhật cuối cùng của đơn hàng", example = "2023-01-01T00:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Danh sách các mặt hàng trong đơn hàng")
    private List<OrderItemResponse> orderItemResponses;

    @Schema(description = "Danh sách các giảm giá có sẵn cho đơn hàng")
    private List<DiscountCodeDTO> availableDiscounts;

    // Thông tin voucher
    private List<DiscountCodeDTO> availableVouchers;
    private DiscountCodeDTO appliedVoucher;
    private BigDecimal discountAmount;
    private BigDecimal originalAmount; // Tổng tiền trước giảm giá

}