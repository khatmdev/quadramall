package com.quadra.ecommerce_api.dto.base.order;

import com.quadra.ecommerce_api.dto.base.product.AddonDTO;
import com.quadra.ecommerce_api.dto.base.product.ProductVariantDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderItemDTO {
    private Long id;
    private ProductVariantDTO variant;
    private OrderDTO order;
    private Integer quantity;
    private BigDecimal priceAtTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
