package com.quadra.ecommerce_api.dto.buyer.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "DTO chứa thông tin mã giảm giá")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCodeDto {

    @Schema(description = "ID của mã giảm giá", example = "1")
    private Long id;

    @Schema(description = "Mã giảm giá", example = "SUMMER2025")
    private String code;

    @Schema(description = "Mô tả mã giảm giá", example = "Giảm giá mùa hè 2025")
    private String description;

    @Schema(description = "Loại giảm giá (PERCENTAGE hoặc FIXED)", example = "PERCENTAGE")
    private String discountType;

    @Schema(description = "Giá trị giảm giá", example = "10.00")
    private BigDecimal discountValue;

    @Schema(description = "Số tiền tối thiểu để áp dụng mã", example = "50.00")
    private BigDecimal minOrderAmount;

    @Schema(description = "Giá trị giảm giá tối đa", example = "100.00")
    private BigDecimal maxDiscountValue;

    @Schema(description = "Ngày bắt đầu hiệu lực", example = "2025-07-01")
    private LocalDate startDate;

    @Schema(description = "Ngày kết thúc hiệu lực", example = "2025-08-31")
    private LocalDate endDate;

    @Schema(description = "Trạng thái mã giảm giá", example = "true")
    private boolean isActive;

    @Schema(description = "Số lượng mã giảm giá", example = "100")
    private Integer quantity;

    @Schema(description = "Số lần sử dụng tối đa", example = "100")
    private Integer maxUses;

    @Schema(description = "Số lần đã sử dụng", example = "50")
    private Integer usedCount;

    @Schema(description = "Trạng thái xem user đã lưu voucher này chưa", example = "true")
    private boolean isSaved;
}