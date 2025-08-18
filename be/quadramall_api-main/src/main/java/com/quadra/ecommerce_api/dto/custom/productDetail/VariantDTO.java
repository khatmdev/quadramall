package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VariantDTO {
    private Long id;
    private String sku;
    private BigDecimal price; // Giá gốc
    private BigDecimal discountedPrice; // Giá sau giảm (flash sale)
    private Integer stockQuantity;
    private String imageUrl;
    private String altText;
}
