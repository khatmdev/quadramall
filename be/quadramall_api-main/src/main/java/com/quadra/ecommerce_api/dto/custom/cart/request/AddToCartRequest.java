package com.quadra.ecommerce_api.dto.custom.cart.request;

import lombok.Data;

import java.util.List;

@Data
public class AddToCartRequest {
    private Long productId;
    private Long variantId;
    private int quantity;
    private List<Long> addonIds;
}
