package com.quadra.ecommerce_api.dto.custom.shipping.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShipperStatsDTO {
    private String shipperCode;
    private String shipperName;
    private BigDecimal rating;
    private Integer totalDeliveries;
    private Integer successfulDeliveries;
    private BigDecimal successRate;
    private Integer todayDeliveries;
    private Integer pendingDeliveries;
}