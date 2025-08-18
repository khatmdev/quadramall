package com.quadra.ecommerce_api.dto.base.flashsale;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FlashSaleInput {
    Integer getPercentageDiscount();
    Integer getQuantity();
    LocalDateTime getStartTime();
    LocalDateTime getEndTime();
}

