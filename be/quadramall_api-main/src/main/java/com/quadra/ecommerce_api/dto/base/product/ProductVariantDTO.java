package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductVariantDTO {
    private Long id;
    private ProductDTO product;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isActive;
    private String imageUrl;
    private String altText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
