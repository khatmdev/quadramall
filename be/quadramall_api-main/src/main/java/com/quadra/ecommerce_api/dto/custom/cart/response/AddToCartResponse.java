package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;

@Data
public class AddToCartResponse {
    private String message;
    private Long cartItemId;
    private int totalQuantity;

    public AddToCartResponse(String message, Long cartItemId, int totalQuantity) {
        this.message = message;
        this.cartItemId = cartItemId;
        this.totalQuantity = totalQuantity;
    }
}
