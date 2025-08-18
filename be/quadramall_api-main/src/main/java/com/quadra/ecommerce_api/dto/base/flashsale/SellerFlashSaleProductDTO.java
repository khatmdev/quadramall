package com.quadra.ecommerce_api.dto.base.flashsale;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@Data
public class SellerFlashSaleProductDTO {
    private Long id;

    private Long productId;

    private String productName;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer percentageDiscount;

    private Integer stock;
    private Integer quantity;
    private Integer soldCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime endTime;
}
