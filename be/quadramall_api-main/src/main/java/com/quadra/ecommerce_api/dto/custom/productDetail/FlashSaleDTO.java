package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FlashSaleDTO {
    private Integer percentageDiscount;
    private Integer remainingQuantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
