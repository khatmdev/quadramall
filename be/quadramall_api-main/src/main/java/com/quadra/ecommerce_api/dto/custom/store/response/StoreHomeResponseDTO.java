package com.quadra.ecommerce_api.dto.custom.store.response;

public record StoreHomeResponseDTO(
        Long id,
        String name,
        double rating,
        String slug,
        String logoUrl
) {}
