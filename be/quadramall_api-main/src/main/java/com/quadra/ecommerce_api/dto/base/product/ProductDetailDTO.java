package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

@Data
public class ProductDetailDTO {
    private Long id;
    private ProductVariantDTO variant;
    private AttributeValueDTO attributeValue;
}
