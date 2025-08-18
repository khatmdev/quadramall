package com.quadra.ecommerce_api.dto.custom.shipping.response;

import com.quadra.ecommerce_api.enums.shipping.RegistrationStatus;
import com.quadra.ecommerce_api.enums.shipping.VehicleType;
import jakarta.persistence.Column;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ShipperRegistrationResponse {
    private Long id;
    private String userFullName;
    private String userEmail;
    private VehicleType vehicleType;
    private String licensePlate;
    private String idCardNumber;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String driverLicenseUrl;
    private RegistrationStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
