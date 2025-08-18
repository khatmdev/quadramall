package com.quadra.ecommerce_api.dto.base.product;

import com.quadra.ecommerce_api.dto.base.store.CategoryDTO;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import com.quadra.ecommerce_api.dto.base.store.StoreDTO;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductDTO {
    private Long id;
    private StoreDTO store;
    private ItemTypeDTO itemType;
    private CategoryDTO category;
    private String name;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

