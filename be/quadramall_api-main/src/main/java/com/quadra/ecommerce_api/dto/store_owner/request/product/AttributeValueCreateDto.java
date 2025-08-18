package com.quadra.ecommerce_api.dto.store_owner.request.product;

import com.quadra.ecommerce_api.enums.product.AttributeType;
import lombok.Data;

@Data
public class AttributeValueCreateDto {
    private String attributeName; // Tên của Attribute
    private String value;         // Giá trị của AttributeValue
    private AttributeType typesValue; // Loại attribute, optional
}
