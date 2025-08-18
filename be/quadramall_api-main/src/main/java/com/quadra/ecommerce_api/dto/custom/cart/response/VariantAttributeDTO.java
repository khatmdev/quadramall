package com.quadra.ecommerce_api.dto.custom.cart.response;


import lombok.Data;

@Data
public class VariantAttributeDTO {
    private Long variantId;
    private String attributeName;
    private String attributeValue;
}
