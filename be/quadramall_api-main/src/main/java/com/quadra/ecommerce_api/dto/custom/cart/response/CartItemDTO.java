package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;

import java.util.List;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String slug;
    private String productName;
    private Long variantId;
    private String variantAttributeNames;
    private Integer quantity;
    private List<CartAddonDTO> addons;
    private Double totalPrice;
    private String image;
    private Boolean inStock;
    private Double price;
    private Boolean isActive;
    private List<VariantAttributeDTO> variantAttributes;
    private List<VariantAttributeDTO> allVariantAttributes;
    private List<AttributeDTO> availableAttributes;
    private List<VariantDTO> variants;
    private FlashSaleDTO flashSale;
}
