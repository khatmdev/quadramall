package com.quadra.ecommerce_api.dto.custom.orderManagerment.request;

import com.quadra.ecommerce_api.enums.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFilterRequest {
    private OrderStatus status;
    private String startDate;
    private String endDate;
    private String customerName;
    private String orderId;
}