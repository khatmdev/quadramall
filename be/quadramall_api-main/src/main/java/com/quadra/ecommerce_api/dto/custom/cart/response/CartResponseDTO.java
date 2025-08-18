package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;
import java.util.List;

@Data
public class CartResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long variantId;
    private String variantSku;
    private int quantity;
    private List<CartAddonDTO> addons;
    private double totalPrice;

    @Data
    public static class CartAddonDTO {
        private Long addonId;
        private String addonName;
        private double priceAdjust;
    }
}