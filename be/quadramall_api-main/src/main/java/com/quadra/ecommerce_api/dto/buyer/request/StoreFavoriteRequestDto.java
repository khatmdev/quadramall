package com.quadra.ecommerce_api.dto.buyer.request;


import lombok.Data;

@Data
public class StoreFavoriteRequestDto {
    private Long userId;
    private Long storeId;
    private boolean isFavorite;
}
