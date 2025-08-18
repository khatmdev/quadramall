package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;

@Data
public class CartAddonDTO {
    private Long addonId;
    private String addonName;
    private double priceAdjust;
}