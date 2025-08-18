package com.quadra.ecommerce_api.dto.base.store;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private StoreDTO store;
    private String name;
    private String slug;
    private String description;
    private CategoryDTO parent;
}
