package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

@Data
public class ProductImageDTO {
    private String imageUrl;
    private String altText;
    private Boolean isThumbnail;
}
