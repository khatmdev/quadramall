package com.quadra.ecommerce_api.dto.base.flashsale;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UpdateFlashSaleDTO implements FlashSaleInput{
    private Integer percentageDiscount;
    private Integer quantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
