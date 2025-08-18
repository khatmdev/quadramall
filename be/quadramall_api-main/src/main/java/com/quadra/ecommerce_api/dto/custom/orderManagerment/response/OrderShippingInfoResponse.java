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
public class OrderShippingInfoResponse {
    // Pickup Address
    private String pickupAddress;
    private String pickupWard;
    private String pickupDistrict;
    private String pickupProvince;

    // Delivery Address
    private String deliveryAddress;
    private String deliveryWard;
    private String deliveryDistrict;
    private String deliveryProvince;
    private String deliveryName;

    private BigDecimal shippingCost;
}