package com.quadra.ecommerce_api.dto.custom.discount.response;

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
public class DiscountCalculationResponse {
    private Boolean success;
    private String message;
    private boolean discountPerProduct;
    private String discountCode;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String discountDescription;
    private List<Long> applicableProductIds;
}