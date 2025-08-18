package com.quadra.ecommerce_api.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PriceCommon {
    public static BigDecimal calculateDiscountedPrice(BigDecimal originPrice, int discountPercent) {
        return originPrice
                .multiply(BigDecimal.valueOf(100 - discountPercent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }
}
