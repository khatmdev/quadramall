package com.quadra.ecommerce_api.dto.custom.orderManagerment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDetailResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String variantName;
    private String sku;
    private int quantity;
    private BigDecimal priceAtTime;
    private BigDecimal totalPrice;
}
