package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.util.List;

@Data
public class AddonGroupDTO {
    private Long id;
    private String name;
    private Integer maxChoice;
    private List<AddonDTO> addons;
}
