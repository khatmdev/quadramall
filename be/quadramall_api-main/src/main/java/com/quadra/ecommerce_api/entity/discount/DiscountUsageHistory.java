package com.quadra.ecommerce_api.entity.discount;

import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.order.Order;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "discount_usage_history", indexes = {
        @Index(name = "idx_discount_history_discount", columnList = "discount_code_id"),
        @Index(name = "idx_discount_history_user", columnList = "user_id"),
        @Index(name = "idx_discount_history_date", columnList = "used_at")
})
public class DiscountUsageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_code_id", nullable = false)
    private DiscountCode discountCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "discount_amount", nullable = false, precision = 38, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "original_amount", nullable = false, precision = 38, scale = 2)
    private BigDecimal originalAmount;

    @Column(name = "final_amount", nullable = false, precision = 38, scale = 2)
    private BigDecimal finalAmount;

    @CreationTimestamp
    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;
}