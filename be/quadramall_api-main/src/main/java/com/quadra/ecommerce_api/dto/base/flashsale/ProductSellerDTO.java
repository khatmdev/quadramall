package com.quadra.ecommerce_api.dto.base.flashsale;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ProductSellerDTO {
    private Long id;
    private String name;
    private Integer percentageDiscount;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer stock;
}
