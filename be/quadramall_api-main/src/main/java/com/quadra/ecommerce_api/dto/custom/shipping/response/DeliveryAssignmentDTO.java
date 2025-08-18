package com.quadra.ecommerce_api.dto.custom.shipping.response;

import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeliveryAssignmentDTO {
    private Long id;
    private Long orderId;
    private String storeName;
    private BigDecimal totalAmount;
    private String customerName;
    private String customerPhone;
    private String pickupAddress;
    private String deliveryAddress;
    private DeliveryStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime estimatedDelivery;
    private String deliveryNotes;
    private LocalDateTime createdAt;
    private BigDecimal collectAmount; // Số tiền shipper cần thu hộ
}