package com.quadra.ecommerce_api.dto.custom.discount.request;

import com.quadra.ecommerce_api.enums.discount.DiscountType;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
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
public class CreateDiscountCodeRequest {
    @NotNull(message = "Store ID không được null")
    private Long storeId;

    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Số lần sử dụng tối đa không được null")
    @Min(value = 1, message = "Số lần sử dụng tối đa phải lớn hơn 0")
    private Integer maxUses;

    @Builder.Default
    @Min(value = 1, message = "Số lần sử dụng của 1 khách hàng phải lớn hơn 0")
    private Integer usagePerCustomer = 1;

    @NotBlank(message = "Mã giảm giá không được trống")
    @Size(max = 50, message = "Mã giảm giá không được quá 50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Mã giảm giá chỉ được chứa chữ hoa, số, dấu gạch dưới và dấu gạch ngang")
    private String code;

    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;

    @NotNull(message = "Loại giảm giá không được null")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm giá không được null")
    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;

    @NotNull(message = "Số tiền đơn hàng tối thiểu không được null")
    @DecimalMin(value = "0", message = "Số tiền đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.01", message = "Giá trị giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountValue;

    @NotNull(message = "Thời gian bắt đầu không được null")
    @Future(message = "Thời gian bắt đầu phải trong tương lai")
    private LocalDateTime startDate;

    @NotNull(message = "Thời gian kết thúc không được null")
    private LocalDateTime endDate;

    @NotNull(message = "Phạm vi áp dụng không được null")
    private AppliesTo appliesTo;

    @Builder.Default
    private Boolean autoApply = false;

    @Builder.Default
    @Min(value = 0, message = "Độ ưu tiên phải lớn hơn hoặc bằng 0")
    private Integer priority = 0;

    // Chỉ cần khi appliesTo = PRODUCTS
    private List<Long> productIds;

    @AssertTrue(message = "Thời gian kết thúc phải sau thời gian bắt đầu")
    public boolean isValidDateRange() {
        return startDate != null && endDate != null && endDate.isAfter(startDate);
    }

    @AssertTrue(message = "Khi áp dụng cho sản phẩm cụ thể, phải chọn ít nhất 1 sản phẩm")
    public boolean isValidProductSelection() {
        if (appliesTo == AppliesTo.PRODUCTS) {
            return productIds != null && !productIds.isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Với loại giảm theo phần trăm, giá trị phải từ 1-100")
    public boolean isValidDiscountValue() {
        if (discountType == DiscountType.PERCENTAGE) {
            return discountValue != null &&
                    discountValue.compareTo(BigDecimal.ONE) >= 0 &&
                    discountValue.compareTo(BigDecimal.valueOf(100)) <= 0;
        }
        return true;
    }
}