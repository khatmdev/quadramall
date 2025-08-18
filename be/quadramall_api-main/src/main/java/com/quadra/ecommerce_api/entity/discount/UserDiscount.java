package com.quadra.ecommerce_api.entity.discount;

import com.quadra.ecommerce_api.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_discounts")
@IdClass(UserDiscountId.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDiscount {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "discount_id")
    private Long discountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", insertable = false, updatable = false)
    private DiscountCode discountCode;

    @Column(name = "used_at")
    private LocalDateTime usedAt;


}