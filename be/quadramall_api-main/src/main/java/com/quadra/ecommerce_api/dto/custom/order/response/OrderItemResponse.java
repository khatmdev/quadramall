package com.quadra.ecommerce_api.dto.custom.order.response;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Chi tiết một mặt hàng trong đơn hàng")
public class OrderItemResponse {
    @Schema(description = "Mã định danh duy nhất của mặt hàng trong đơn hàng", example = "1")
    private Long id;

    @Schema(description = "Biến thể của sản phẩm được đặt hàng")
    private OrderProductVariantResponse productVariant;

    @Schema(description = "Số lượng của mặt hàng", example = "2")
    private Integer quantity;

    @Schema(description = "Giá của mặt hàng tại thời điểm đặt hàng", example = "100.00")
    private BigDecimal priceAtTime;

    @Schema(description = "Thời điểm tạo mặt hàng trong đơn hàng", example = "2023-01-01T00:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời điểm cập nhật cuối cùng của mặt hàng trong đơn hàng", example = "2023-01-01T00:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Danh sách các addon của mặt hàng")
    private List<OrderItemAddonResponse> addons;

    @Schema(description = "Tổng giá của mặt hàng, bao gồm cả addon", example = "220.00")
    private BigDecimal totalItemPrice;

    // ✅ THÊM CÁC FIELD CHO FLASH SALE
    @Schema(description = "Thông tin Flash Sale nếu có")
    private OrderItemFlashSaleInfo flashSale;

    @Schema(description = "Giá gốc trước khi áp dụng Flash Sale", example = "120.00")
    private BigDecimal originalPrice;

    @Schema(description = "Có áp dụng Flash Sale hay không", example = "true")
    private Boolean hasFlashSale;

    @Schema(description = "Số tiền tiết kiệm được từ Flash Sale", example = "40.00")
    private BigDecimal flashSaleSavings;

    // Helper method để tự động tính flashSaleSavings
    public BigDecimal getFlashSaleSavings() {
        if (hasFlashSale != null && hasFlashSale && originalPrice != null && priceAtTime != null) {
            BigDecimal originalTotal = originalPrice.multiply(BigDecimal.valueOf(quantity));
            BigDecimal flashSaleTotal = priceAtTime.multiply(BigDecimal.valueOf(quantity));
            return originalTotal.subtract(flashSaleTotal);
        }
        return BigDecimal.ZERO;
    }
}