package com.quadra.ecommerce_api.dto.custom.shipping.response;


import com.quadra.ecommerce_api.enums.shipping.RegistrationStatus;
import com.quadra.ecommerce_api.enums.shipping.VehicleType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShipperRegistrationStatusResponse {
    // Registration info (always available)
    private Long registrationId;
    private String userFullName;
    private String userEmail;
    private VehicleType vehicleType;
    private String licensePlate;
    private String idCardNumber;
    private RegistrationStatus status;
    private String rejectionReason;
    private LocalDateTime registrationCreatedAt;
    private LocalDateTime registrationUpdatedAt;

    // Shipper info (only if approved)
    private Long shipperId;
    private String shipperCode;
    private Boolean isActive;
    private Integer totalDeliveries;
    private Integer successfulDeliveries;
    private java.math.BigDecimal rating;
    private LocalDateTime shipperCreatedAt;

    // Helper method to check if user is approved shipper
    public boolean isApprovedShipper() {
        return status == RegistrationStatus.APPROVED && shipperId != null;
    }
}