package com.quadra.ecommerce_api.dto.custom.shipping.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AvailableOrderDTO {
    private Long orderId;
    private String storeName;
    private BigDecimal totalAmount;
    private String pickupAddress;
    private String pickupProvince;
    private String pickupDistrict;
    private String pickupWard;
    private String deliveryAddress;
    private String deliveryProvince;
    private String deliveryDistrict;
    private String deliveryWard;
    private BigDecimal shippingCost;
    private LocalDateTime estimatedPickupTime;
    private LocalDateTime estimatedDeliveryTime;
    private Double distanceKm;
    private LocalDateTime createdAt;
    private BigDecimal collectAmount; // Số tiền shipper cần thu hộ
}