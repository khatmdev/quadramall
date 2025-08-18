package com.quadra.ecommerce_api.repository.discount;

import com.quadra.ecommerce_api.entity.discount.DiscountUsageHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiscountUsageHistoryRepository extends JpaRepository<DiscountUsageHistory, Long> {

    // Lấy lịch sử sử dụng theo discount code
    Page<DiscountUsageHistory> findByDiscountCodeIdOrderByUsedAtDesc(Long discountCodeId, Pageable pageable);

    // Lấy lịch sử sử dụng theo user
    Page<DiscountUsageHistory> findByUserIdOrderByUsedAtDesc(Long userId, Pageable pageable);

    // Thống kê tổng tiền đã giảm theo voucher
    @Query("SELECT SUM(duh.discountAmount) FROM DiscountUsageHistory duh WHERE duh.discountCode.id = :discountCodeId")
    BigDecimal getTotalDiscountAmountByCode(@Param("discountCodeId") Long discountCodeId);

    // Thống kê tổng tiền đã giảm theo store
    @Query("SELECT SUM(duh.discountAmount) FROM DiscountUsageHistory duh WHERE " +
            "duh.discountCode.store.id = :storeId AND " +
            "duh.usedAt BETWEEN :startTime AND :endTime")
    BigDecimal getTotalDiscountAmountByStore(@Param("storeId") Long storeId,
                                             @Param("startTime") LocalDateTime startTime,
                                             @Param("endTime") LocalDateTime endTime);

    // Top voucher được sử dụng nhiều nhất
    @Query("SELECT duh.discountCode.code, COUNT(duh) as usageCount, SUM(duh.discountAmount) as totalDiscount " +
            "FROM DiscountUsageHistory duh " +
            "WHERE duh.discountCode.store.id = :storeId AND " +
            "duh.usedAt BETWEEN :startTime AND :endTime " +
            "GROUP BY duh.discountCode.id, duh.discountCode.code " +
            "ORDER BY usageCount DESC")
    List<Object[]> getTopUsedDiscountCodes(@Param("storeId") Long storeId,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime,
                                           Pageable pageable);
}