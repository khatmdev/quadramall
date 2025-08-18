package com.quadra.ecommerce_api.dto.base.discount;

import com.quadra.ecommerce_api.dto.base.store.StoreDTO;
import com.quadra.ecommerce_api.enums.discount.DiscountType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DiscountCodeDTO {
    private Long id;
    private StoreDTO store;
    private Integer quantity;
    private Integer maxUses;
    private Integer usedCount;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
