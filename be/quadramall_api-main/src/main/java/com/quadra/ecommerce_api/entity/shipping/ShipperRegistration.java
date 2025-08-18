package com.quadra.ecommerce_api.entity.shipping;


import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.shipping.RegistrationStatus;
import com.quadra.ecommerce_api.enums.shipping.VehicleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "shipper_registrations")
public class ShipperRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(name = "id_card_number", nullable = false, length = 20)
    private String idCardNumber;

    @Column(name = "id_card_front_url", nullable = false)
    private String idCardFrontUrl;

    @Column(name = "id_card_back_url", nullable = false)
    private String idCardBackUrl;

    @Column(name = "driver_license_url")
    private String driverLicenseUrl;

    @Column(name = "vehicle_registration_url")
    private String vehicleRegistrationUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;



    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
