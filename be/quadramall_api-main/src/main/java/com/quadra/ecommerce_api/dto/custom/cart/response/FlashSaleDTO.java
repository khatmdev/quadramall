package com.quadra.ecommerce_api.dto.custom.cart.response;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlashSaleDTO {
    private Long id;
    private Integer percentageDiscount;
    private LocalDateTime endTime;
    private Integer soldCount;      // Để hiển thị đã bán bao nhiêu
    private Integer quantity;       // Tổng số lượng flash sale
}