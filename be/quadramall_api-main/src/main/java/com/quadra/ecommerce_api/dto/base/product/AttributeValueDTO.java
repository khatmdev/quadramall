package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

@Data
public class AttributeValueDTO {
    private Long id;
    private AttributeDTO attribute;
    private String value;
}
