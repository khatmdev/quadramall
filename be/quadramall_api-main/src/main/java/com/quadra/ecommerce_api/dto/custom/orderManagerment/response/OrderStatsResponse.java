package com.quadra.ecommerce_api.dto.custom.orderManagerment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponse {
    private Long totalOrders;
    private Long pendingOrders;
    private Long processingOrders;
    private Long confirmedPreparingOrders;
    private Long assignedToShipperOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal weeklyRevenue;
}
