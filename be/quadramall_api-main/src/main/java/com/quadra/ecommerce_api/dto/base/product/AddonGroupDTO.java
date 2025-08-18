package com.quadra.ecommerce_api.dto.base.product;

import lombok.Data;

@Data
public class AddonGroupDTO {
    private Long id;
    private ProductDTO product;
    private String name;
    private Integer maxChoice;
}
