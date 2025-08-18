package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.util.List;

@Data
public class AttributeDTO {
    private String name;
    private List<String> values;
}
