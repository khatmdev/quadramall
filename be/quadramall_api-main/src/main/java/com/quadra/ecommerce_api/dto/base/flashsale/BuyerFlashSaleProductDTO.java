package com.quadra.ecommerce_api.dto.base.flashsale;

import com.quadra.ecommerce_api.dto.custom.store.response.SellerInfoDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@Data
public class BuyerFlashSaleProductDTO {
    private Long id;
    private String name;
    private String slug;
    private String thumbnailUrl;
    private BigDecimal originPrice;
    private BigDecimal price;
    private Integer percentageDiscount;
    private Integer quantity;
    private Integer soldCount;
    private SellerInfoDTO seller;
    private String endTimeStr;
}

