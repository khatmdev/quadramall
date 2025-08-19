package com.quadra.ecommerce_api.dto.store_owner.response.store;

import com.quadra.ecommerce_api.enums.store.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreInfoDto {
    private Long id;
    private String name;
    private String slug;
    private String address;
    private String description;
    private String logoUrl;
    private StoreStatus status;
    private String lockReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}