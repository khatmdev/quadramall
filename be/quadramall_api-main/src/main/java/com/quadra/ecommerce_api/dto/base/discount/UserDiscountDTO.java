package com.quadra.ecommerce_api.dto.base.discount;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDiscountDTO {
    private Long userId;
    private Long discountId;
    private LocalDateTime usedAt;
}
