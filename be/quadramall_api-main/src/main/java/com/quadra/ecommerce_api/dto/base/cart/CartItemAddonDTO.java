package com.quadra.ecommerce_api.dto.base.cart;

import com.quadra.ecommerce_api.dto.base.product.AddonDTO;
import lombok.Data;

@Data
public class CartItemAddonDTO {
    private Long id;
    private CartItemDTO cartItem;
    private AddonDTO addon;
}
