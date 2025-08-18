package com.quadra.ecommerce_api.entity.shipping;

import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.enums.shipping.ShippingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

@Entity
@Table(name = "order_shipping")
public class OrderShipping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "shipping_partner_id")
    private ShippingPartner shippingPartner;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "shipping_status", nullable = false)
    private ShippingStatus shippingStatus = ShippingStatus.PENDING;

    @Builder.Default
    @Column(name = "shipping_cost", nullable = false)
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "pickup_name", nullable = false)
    private String pickupName;

    @Column(name = "pickup_phone", nullable = false)
    private String pickupPhone;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "pickup_province", nullable = false)
    private String pickupProvince;

    @Column(name = "pickup_district", nullable = false)
    private String pickupDistrict;

    @Column(name = "pickup_ward", nullable = false)
    private String pickupWard;

    @Column(name = "delivery_name", nullable = false)
    private String deliveryName;

    @Column(name = "delivery_phone", nullable = false)
    private String deliveryPhone;

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Column(name = "delivery_province", nullable = false)
    private String deliveryProvince;

    @Column(name = "delivery_district", nullable = false)
    private String deliveryDistrict;

    @Column(name = "delivery_ward", nullable = false)
    private String deliveryWard;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
