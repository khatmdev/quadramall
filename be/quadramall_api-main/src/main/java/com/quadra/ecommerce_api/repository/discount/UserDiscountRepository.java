package com.quadra.ecommerce_api.repository.discount;

import com.quadra.ecommerce_api.entity.discount.UserDiscount;
import com.quadra.ecommerce_api.entity.discount.UserDiscountId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserDiscountRepository extends JpaRepository<UserDiscount, UserDiscountId> {

    // Đếm số lần user đã sử dụng voucher cụ thể
    @Query("SELECT COUNT(ud) FROM UserDiscount ud WHERE " +
            "ud.discountCode.id = :discountCodeId AND ud.user.id = :userId")
    Integer countUserDiscountUsage(@Param("discountCodeId") Long discountCodeId,
                                   @Param("userId") Long userId);

    // Lấy danh sách voucher đã sử dụng của user
    @Query("SELECT ud FROM UserDiscount ud WHERE ud.user.id = :userId ORDER BY ud.usedAt DESC")
    List<UserDiscount> findByUserId(@Param("userId") Long userId);

    // Lấy lịch sử sử dụng voucher theo store
    @Query("SELECT ud FROM UserDiscount ud WHERE " +
            "ud.user.id = :userId AND ud.discountCode.store.id = :storeId " +
            "ORDER BY ud.usedAt DESC")
    List<UserDiscount> findByUserIdAndStoreId(@Param("userId") Long userId,
                                              @Param("storeId") Long storeId);

    // Kiểm tra user đã sử dụng voucher này chưa
    boolean existsByUserIdAndDiscountCodeId(Long userId, Long discountCodeId);

    // Lấy thống kê sử dụng voucher theo thời gian
    @Query("SELECT DATE(ud.usedAt) as date, COUNT(ud) as count " +
            "FROM UserDiscount ud " +
            "WHERE ud.discountCode.store.id = :storeId AND " +
            "ud.usedAt BETWEEN :startTime AND :endTime " +
            "GROUP BY DATE(ud.usedAt) " +
            "ORDER BY DATE(ud.usedAt)")
    List<Object[]> getUsageStatsByStore(@Param("storeId") Long storeId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);

    boolean existsByUserIdAndDiscountCode_Id(Long userId, Long discountId);
}