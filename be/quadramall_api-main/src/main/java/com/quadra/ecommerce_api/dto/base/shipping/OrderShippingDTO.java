package com.quadra.ecommerce_api.dto.base.shipping;

import com.quadra.ecommerce_api.dto.base.order.OrderDTO;
import com.quadra.ecommerce_api.enums.shipping.ShippingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrderShippingDTO {
    private Long id;
    private OrderDTO order;
    private ShippingPartnerDTO shippingPartner;
    private String trackingNumber;
    private LocalDate estimatedDelivery;
    private ShippingStatus shippingStatus;
    private BigDecimal shippingCost;
    private String pickupName;
    private String pickupPhone;
    private String pickupAddress;
    private String pickupProvince;
    private String pickupDistrict;
    private String pickupWard;
    private String deliveryName;
    private String deliveryPhone;
    private String deliveryAddress;
    private String deliveryProvince;
    private String deliveryDistrict;
    private String deliveryWard;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
