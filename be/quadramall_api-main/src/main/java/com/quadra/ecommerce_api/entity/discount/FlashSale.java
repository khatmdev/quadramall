package com.quadra.ecommerce_api.entity.discount;

import com.quadra.ecommerce_api.entity.product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    @Positive(message = "Percentage of Discount must be positive")
    private Integer percentageDiscount;

    @Column(nullable = false)
    @PositiveOrZero(message = "Sold count must be non-negative")
    @Builder.Default
    private Integer soldCount = 0;

    @Column(nullable = false)
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @Column(nullable = false)
    @FutureOrPresent(message = "Start time must be now or in the future")
    private LocalDateTime startTime;

    @Column(nullable = false)
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

}

