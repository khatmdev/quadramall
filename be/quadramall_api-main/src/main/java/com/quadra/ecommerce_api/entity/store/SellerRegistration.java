package com.quadra.ecommerce_api.entity.store;

import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import com.quadra.ecommerce_api.utils.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "seller_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "description")
    private String description;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "business_license_url")
    private String businessLicenseUrl;

    @Convert(converter = StringListConverter.class)
    @Column(name = "id_card_url")
    private List<String> idCardUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
