package com.quadra.ecommerce_api.dto.base.product;

import com.quadra.ecommerce_api.enums.product.AttributeType;
import lombok.Data;

@Data
public class AttributeDTO {
    private Long id;
    private String name;
    private AttributeType typesValue;
}

