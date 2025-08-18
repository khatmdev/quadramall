package com.quadra.ecommerce_api.dto.custom.orderManagerment.response;

import com.quadra.ecommerce_api.enums.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTimelineResponse {
    private OrderStatus status;
    private String statusDisplayName;
    private String description;
    private LocalDateTime timestamp;
    private String note;
}