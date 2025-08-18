package com.quadra.ecommerce_api.dto.custom.discount.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDiscountCodeRequest {
    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;

    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0", message = "Số tiền đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.01", message = "Giá trị giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountValue;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean autoApply;

    @Min(value = 0, message = "Độ ưu tiên phải lớn hơn hoặc bằng 0")
    private Integer priority;

    private List<Long> productIds;

    private Boolean isActive;

    @AssertTrue(message = "Thời gian kết thúc phải sau thời gian bắt đầu")
    public boolean isValidDateRange() {
        if (startDate != null && endDate != null) {
            return endDate.isAfter(startDate);
        }
        return true;
    }
}