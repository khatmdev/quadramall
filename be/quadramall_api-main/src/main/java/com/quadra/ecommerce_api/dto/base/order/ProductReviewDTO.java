package com.quadra.ecommerce_api.dto.base.order;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductReviewDTO {
    private Long id;
    private OrderItemDTO orderItem;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
