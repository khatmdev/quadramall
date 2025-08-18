package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

@Data
public class StoreDTO {
    private Long id;
    private String name;
    private String slug;
    private String address;
    private String description;
    private String logoUrl;
    private Double rating;
    private Integer productCount;
    private boolean isFavorite;
    private Integer reviewCount;
}
