package com.quadra.ecommerce_api.dto.custom.cart.request;

import lombok.Data;

import java.util.List;


@Data
public class UpdateCartItemVariantRequest {
    private Long variantId;
    private List<Long> addonIds;
}
