package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;

@Data
public class SpecificationValueCreateDto {
    private String specificationName;
    private String value;
}
