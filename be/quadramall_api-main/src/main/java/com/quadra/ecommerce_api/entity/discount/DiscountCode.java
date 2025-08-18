package com.quadra.ecommerce_api.entity.discount;

import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.discount.DiscountType;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
import com.quadra.ecommerce_api.entity.product.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Slf4j
@Data
@Builder
@Entity
@Table(name = "discount_codes", indexes = {
        @Index(name = "idx_discount_codes_store_active", columnList = "store_id, is_active"),
        @Index(name = "idx_discount_codes_dates", columnList = "start_date, end_date"),
        @Index(name = "idx_discount_codes_code", columnList = "code"),
        @Index(name = "idx_discount_codes_applies_to", columnList = "applies_to, is_active")
})
public class DiscountCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "max_uses", nullable = false)
    private Integer maxUses;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Builder.Default
    @Column(name = "usage_per_customer")
    private Integer usagePerCustomer = 1;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 38, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount", nullable = false, precision = 38, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "max_discount_value", precision = 38, scale = 2)
    private BigDecimal maxDiscountValue;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "applies_to", nullable = false)
    private AppliesTo appliesTo = AppliesTo.SHOP;

    @Builder.Default
    @Column(name = "auto_apply")
    private Boolean autoApply = false;

    @Builder.Default
    @Column(name = "priority")
    private Integer priority = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Danh sách sản phẩm áp dụng (chỉ có khi appliesTo = PRODUCTS)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "discount_code_products",
            joinColumns = @JoinColumn(name = "discount_code_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isValidForUse() {
        LocalDateTime now = LocalDateTime.now();
        boolean isActive = this.isActive != null && this.isActive;
        boolean isWithinDateRange = !now.isBefore(startDate) && !now.isAfter(endDate);
        boolean hasUsageLeft = usedCount < maxUses;

        log.debug("Checking isValidForUse:");
        log.debug("- Is active: {}", isActive);
        log.debug("- Current time: {}", now);
        log.debug("- Start date: {}", startDate);
        log.debug("- End date: {}", endDate);
        log.debug("- Is within date range: {}", isWithinDateRange);
        log.debug("- Used count: {}", usedCount);
        log.debug("- Max uses: {}", maxUses);
        log.debug("- Has usage left: {}", hasUsageLeft);

        boolean result = isActive && isWithinDateRange && hasUsageLeft;
        log.debug("- Final result: {}", result);

        return result;
    }

    // 4. Cải thiện method isApplicableToProduct trong Entity
    public boolean isApplicableToProduct(Long productId) {
        if (appliesTo == AppliesTo.SHOP) {
            log.debug("SHOP type discount - applicable to all products");
            return true;
        }

        if (products == null || products.isEmpty()) {
            log.debug("PRODUCTS type discount but no products configured");
            return false;
        }

        boolean applicable = products.stream()
                .anyMatch(product -> product.getId().equals(productId));

        log.debug("Checking product {} applicability: {}", productId, applicable);
        return applicable;
    }

    public boolean canUserUse(int userUsageCount) {
        return userUsageCount < usagePerCustomer;
    }



    public BigDecimal calculateDiscountAmount(BigDecimal orderAmount, boolean applyPerProduct, int applicableProductCount) {
        // Không check minOrderAmount ở đây vì đã check ở service level
        // Method này chỉ tính pure discount amount

        BigDecimal discountAmount;

        if (discountType == DiscountType.PERCENTAGE) {
            // Tính % discount
            discountAmount = orderAmount.multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

            // Áp dụng giá trị giảm tối đa nếu có
            if (maxDiscountValue != null) {
                if (applyPerProduct && appliesTo == AppliesTo.PRODUCTS) {
                    // Nếu là PRODUCTS + PERCENTAGE, maxDiscountValue áp dụng cho MỖI sản phẩm
                    // Ví dụ: Giảm 20% max 50k/sản phẩm
                    BigDecimal maxPerProduct = maxDiscountValue;
                    BigDecimal actualDiscountPerProduct = discountAmount.divide(
                            BigDecimal.valueOf(applicableProductCount), 2, BigDecimal.ROUND_HALF_UP);

                    if (actualDiscountPerProduct.compareTo(maxPerProduct) > 0) {
                        discountAmount = maxPerProduct.multiply(BigDecimal.valueOf(applicableProductCount));
                    }
                } else {
                    // SHOP discount hoặc không apply per product
                    if (discountAmount.compareTo(maxDiscountValue) > 0) {
                        discountAmount = maxDiscountValue;
                    }
                }
            }
        } else {
            // FIXED
            discountAmount = discountValue;

            // Nếu áp dụng cho mỗi sản phẩm và là voucher PRODUCTS
            if (applyPerProduct && appliesTo == AppliesTo.PRODUCTS) {
                // Nhân với số lượng sản phẩm được áp dụng
                discountAmount = discountAmount.multiply(BigDecimal.valueOf(applicableProductCount));
            }
        }

        // Đảm bảo không giảm quá tổng order
        return discountAmount.min(orderAmount);
    }

    // Thêm method mới để rõ ràng hơn
    public BigDecimal calculateDiscountForProducts(List<OrderItem> orderItems) {
        if (appliesTo != AppliesTo.PRODUCTS || products == null || products.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<Long> voucherProductIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        for (OrderItem item : orderItems) {
            Long productId = item.getVariant().getProduct().getId();

            if (voucherProductIds.contains(productId)) {
                BigDecimal itemTotal = item.getPriceAtTime()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal itemDiscount = BigDecimal.ZERO;

                if (discountType == DiscountType.PERCENTAGE) {
                    // Giảm % cho sản phẩm này
                    itemDiscount = itemTotal.multiply(discountValue)
                            .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

                    // Áp dụng max discount cho mỗi loại sản phẩm
                    if (maxDiscountValue != null && itemDiscount.compareTo(maxDiscountValue) > 0) {
                        itemDiscount = maxDiscountValue;
                    }
                } else {
                    // FIXED - Giảm cố định cho mỗi số lượng
                    BigDecimal discountPerUnit = discountValue;
                    itemDiscount = discountPerUnit.multiply(BigDecimal.valueOf(item.getQuantity()));

                    // Không giảm quá giá trị sản phẩm
                    itemDiscount = itemDiscount.min(itemTotal);
                }

                totalDiscount = totalDiscount.add(itemDiscount);
            }
        }

        return totalDiscount;
    }

    // Thêm method để lấy chi tiết discount cho từng sản phẩm
    public Map<Long, BigDecimal> calculateDiscountByProduct(List<OrderItem> orderItems) {
        Map<Long, BigDecimal> discountByProduct = new HashMap<>();

        if (appliesTo != AppliesTo.PRODUCTS || products == null || products.isEmpty()) {
            return discountByProduct;
        }

        List<Long> voucherProductIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        for (OrderItem item : orderItems) {
            Long productId = item.getVariant().getProduct().getId();

            if (voucherProductIds.contains(productId)) {
                BigDecimal itemTotal = item.getPriceAtTime()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal itemDiscount = BigDecimal.ZERO;

                if (discountType == DiscountType.PERCENTAGE) {
                    itemDiscount = itemTotal.multiply(discountValue)
                            .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

                    if (maxDiscountValue != null && itemDiscount.compareTo(maxDiscountValue) > 0) {
                        itemDiscount = maxDiscountValue;
                    }
                } else {
                    BigDecimal discountPerUnit = discountValue;
                    itemDiscount = discountPerUnit.multiply(BigDecimal.valueOf(item.getQuantity()));
                    itemDiscount = itemDiscount.min(itemTotal);
                }

                discountByProduct.put(item.getId(), itemDiscount);
            }
        }

        return discountByProduct;
    }

    // Overload method cũ để tương thích
    public BigDecimal calculateDiscountAmount(BigDecimal orderAmount) {
        return calculateDiscountAmount(orderAmount, false, 1);
    }

    public void incrementUsedCount() {
        this.usedCount++;
    }


    // Trong DiscountCode.java, thêm method helper
    public boolean isApplicableToProducts(List<Long> productIds) {
        if (appliesTo == AppliesTo.SHOP) {
            return true;
        }

        if (appliesTo == AppliesTo.PRODUCTS && products != null) {
            // Kiểm tra xem có ít nhất một sản phẩm trong danh sách được áp dụng
            return products.stream()
                    .anyMatch(product -> productIds.contains(product.getId()));
        }

        return false;
    }

    //  method để lấy danh sách product IDs được áp dụng
    public List<Long> getApplicableProductIds(List<Long> orderProductIds) {
        if (appliesTo == AppliesTo.SHOP) {
            return orderProductIds; // Áp dụng cho tất cả
        }

        if (appliesTo == AppliesTo.PRODUCTS && products != null) {
            // Chỉ trả về những product có trong cả voucher và order
            return products.stream()
                    .map(Product::getId)
                    .filter(orderProductIds::contains)
                    .collect(Collectors.toList());
        }

        return new ArrayList<>();
    }
}