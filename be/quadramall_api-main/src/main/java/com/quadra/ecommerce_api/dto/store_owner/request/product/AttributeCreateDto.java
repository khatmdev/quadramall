package com.quadra.ecommerce_api.dto.store_owner.request.product;

import com.quadra.ecommerce_api.enums.product.AttributeType;
import lombok.Data;

@Data
public class AttributeCreateDto {
    private String name;
    private AttributeType typesValue = AttributeType.ALL; // Giá trị mặc định
}
