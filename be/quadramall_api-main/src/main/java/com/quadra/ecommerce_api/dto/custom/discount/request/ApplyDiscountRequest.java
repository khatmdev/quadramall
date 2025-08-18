package com.quadra.ecommerce_api.dto.custom.discount.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyDiscountRequest {
    @NotBlank(message = "Mã giảm giá không được trống")
    private String discountCode;

    @NotNull(message = "Tổng tiền đơn hàng không được null")
    @DecimalMin(value = "0.01", message = "Tổng tiền đơn hàng phải lớn hơn 0")
    private BigDecimal orderAmount;

    @NotNull(message = "ID cửa hàng không được null")
    private Long storeId;

    @NotNull(message = "ID khách hàng không được null")
    private Long userId;

    // Danh sách ID sản phẩm trong đơn hàng (để kiểm tra voucher sản phẩm cụ thể)
    private List<Long> productIds;
}