package com.quadra.ecommerce_api.dto.base.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data

public class ItemTypeDTO {
    private Long id;
    private ItemTypeDTO parent;
    private String name;
    private String slug;
    private String description;
    private String iconUrl;
    private Boolean isActive;
}
