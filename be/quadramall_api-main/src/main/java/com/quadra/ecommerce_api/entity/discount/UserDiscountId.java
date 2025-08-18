package com.quadra.ecommerce_api.entity.discount;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class UserDiscountId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "discount_id")
    private Long discountId;
}