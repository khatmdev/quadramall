package com.quadra.ecommerce_api.dto.custom.order.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin Flash Sale cho OrderItem")
public class OrderItemFlashSaleInfo {

    @Schema(description = "ID của Flash Sale", example = "123")
    private Long id;

    @Schema(description = "Phần trăm giảm giá", example = "20.0")
    private Double percentageDiscount;

    @Schema(description = "Số lượng Flash Sale", example = "100")
    private Integer quantity;

    @Schema(description = "Số lượng đã bán", example = "45")
    private Integer soldCount;

    @Schema(description = "Thời gian kết thúc Flash Sale", example = "2024-12-31T23:59:59")
    private String endTime;

    @Schema(description = "Tiền tiết kiệm được từ Flash Sale", example = "50000")
    private BigDecimal savings;

    @Schema(description = "Tỷ lệ đã bán (%)", example = "45.0")
    public Double getSoldPercentage() {
        if (quantity == null || quantity == 0) return 0.0;
        return (double) soldCount / quantity * 100;
    }

    @Schema(description = "Số lượng còn lại", example = "55")
    public Integer getRemainingQuantity() {
        if (quantity == null || soldCount == null) return 0;
        return quantity - soldCount;
    }

    @Schema(description = "Flash Sale có còn hiệu lực không", example = "true")
    public Boolean isActive() {
        return getRemainingQuantity() > 0;
    }
}