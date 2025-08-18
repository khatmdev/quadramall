package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DiscountCodeDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private String startDate;
    private String endDate;
}
