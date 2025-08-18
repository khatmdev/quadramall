package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

@Data
public class ProductImageDTO {
    private Long id;
    private ProductDTO product;
    private String imageUrl;
    private String altText;
    private Boolean isThumbnail;
}
