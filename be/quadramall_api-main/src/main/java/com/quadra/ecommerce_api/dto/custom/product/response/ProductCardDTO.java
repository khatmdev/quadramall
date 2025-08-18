package com.quadra.ecommerce_api.dto.custom.product.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.quadra.ecommerce_api.dto.custom.store.response.SellerInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCardDTO {
    private Long id;
    private String name;
    private double price;
    private String slug;
    private String thumbnailUrl;
    private double rating;
    private long soldCount;
    private SellerInfoDTO seller;

    @JsonProperty("isFav")
    private boolean fav;
}
