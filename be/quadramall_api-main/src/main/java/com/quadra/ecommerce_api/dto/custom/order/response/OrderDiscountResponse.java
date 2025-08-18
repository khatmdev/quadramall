package com.quadra.ecommerce_api.dto.custom.order.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Schema(description = "Thẻ giảm giá có thể sử dụng khi tạo đơn.")
public class OrderDiscountResponse {

    @Schema(description = "Mã định danh duy nhất của thẻ giảm giá", example = "123")
    private Long id;

    @Schema(description = "Mã giảm giá", example = "SUMMER2023")
    private String code;

    @Schema(description = "Số tiền giảm giá", example = "10.00")
    private BigDecimal discountAmount;

    @Schema(description = "Ngày bắt đầu hiệu lực của thẻ giảm giá", example = "2023-01-01T00:00:00")
    private LocalDateTime validFrom;

    @Schema(description = "Ngày hết hiệu lực của thẻ giảm giá", example = "2023-12-31T23:59:59")
    private LocalDateTime validUntil;

    @Schema(description = "Trạng thái hoạt động của thẻ giảm giá", example = "true")
    private Boolean isActive;
}