package com.quadra.ecommerce_api.dto.base.cart;

import com.quadra.ecommerce_api.dto.base.product.ProductVariantDTO;
import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private UserDTO user;
    private ProductVariantDTO variant;
    private Integer quantity;
}

