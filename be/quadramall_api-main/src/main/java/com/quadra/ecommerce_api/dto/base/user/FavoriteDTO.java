package com.quadra.ecommerce_api.dto.base.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDTO {
    private Long id;
    private Long userId;
    private Long productId;
    private LocalDateTime createdAt;
}