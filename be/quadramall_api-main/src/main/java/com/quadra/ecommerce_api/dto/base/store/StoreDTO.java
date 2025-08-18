package com.quadra.ecommerce_api.dto.base.store;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import com.quadra.ecommerce_api.enums.store.StoreStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StoreDTO {
    private Long id;
    private UserDTO owner;
    private String name;
    private String slug;
    private String address;
    private String description;
    private String logoUrl;
    private StoreStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

