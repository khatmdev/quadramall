package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddonDTO {
    private Long id;
    private AddonGroupDTO addonGroup;
    private String name;
    private BigDecimal priceAdjust;
    private Boolean isActive;
}
