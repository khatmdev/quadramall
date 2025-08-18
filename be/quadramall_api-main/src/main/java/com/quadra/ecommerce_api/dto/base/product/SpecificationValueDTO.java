package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

@Data
public class SpecificationValueDTO {
    private Long id;
    private SpecificationDTO specification;
    private ProductDTO product;
    private String value;
}
