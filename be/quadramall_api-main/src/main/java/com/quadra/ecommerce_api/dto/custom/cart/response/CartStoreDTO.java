package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;

import java.util.List;

@Data
public class CartStoreDTO {
    private StoreDTO store;
    private List<CartItemDTO> items;
}
