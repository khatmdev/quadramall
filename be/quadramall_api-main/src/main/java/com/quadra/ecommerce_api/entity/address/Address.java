package com.quadra.ecommerce_api.entity.address;

import com.quadra.ecommerce_api.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    private String receiverPhone;

    @Column(name = "detail_address", nullable = false)
    private String detailAddress;

    @Column(nullable = false)
    private String ward;

    @Column(name = "ward_code", nullable = false)
    private String wardCode;

    @Column(nullable = false)
    private String district;

    @Column(name = "district_code", nullable = false)
    private String districtCode;

    @Column(nullable = false)
    private String city;

    @Column(name = "city_code", nullable = false)
    private String cityCode;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;
}