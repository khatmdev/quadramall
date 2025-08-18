package com.quadra.ecommerce_api.dto.base.order;

import com.quadra.ecommerce_api.dto.base.product.AddonDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderItemAddonDTO {
    private Long id;
    private OrderItemDTO orderItem;
    private AddonDTO addon;
    private BigDecimal priceAdjustAtTime;
    private LocalDateTime createdAt;
}
