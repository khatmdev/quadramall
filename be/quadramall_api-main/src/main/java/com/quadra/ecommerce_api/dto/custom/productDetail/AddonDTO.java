package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddonDTO {
    private Long id;
    private String name;
    private BigDecimal priceAdjust;
}
