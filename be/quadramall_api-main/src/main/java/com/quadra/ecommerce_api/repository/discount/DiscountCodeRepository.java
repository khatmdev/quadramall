package com.quadra.ecommerce_api.repository.discount;

import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {

    // ===== QUERY METHODS =====

    // Tìm theo store
    Page<DiscountCode> findByStoreIdOrderByCreatedAtDesc(Long storeId, Pageable pageable);

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.store.id = :storeId AND dc.isActive = true ORDER BY dc.priority DESC, dc.createdAt DESC")
    List<DiscountCode> findActiveDiscountCodesByStore(@Param("storeId") Long storeId);

    // Tìm theo mã code
    Optional<DiscountCode> findByCode(String code);

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.code = :code AND dc.isActive = true")
    Optional<DiscountCode> findByCodeAndActive(@Param("code") String code);

    // Kiểm tra tồn tại mã code (cho validation tạo mới)
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    // Tìm voucher có thể sử dụng cho shop
    @Query("SELECT dc FROM DiscountCode dc WHERE " +
            "dc.store.id = :storeId AND " +
            "dc.isActive = true AND " +
            "dc.appliesTo = 'SHOP' AND " +
            ":currentTime >= dc.startDate AND " +
            ":currentTime <= dc.endDate AND " +
            "dc.usedCount < dc.maxUses " +
            "ORDER BY dc.priority DESC, dc.discountValue DESC")
    List<DiscountCode> findValidShopDiscountCodes(@Param("storeId") Long storeId,
                                                  @Param("currentTime") LocalDateTime currentTime);

    // Tìm voucher có thể sử dụng cho sản phẩm cụ thể
    @Query("SELECT DISTINCT dc FROM DiscountCode dc " +
            "JOIN dc.products p " +
            "WHERE dc.store.id = :storeId AND " +
            "dc.isActive = true AND " +
            "dc.appliesTo = 'PRODUCTS' AND " +
            "p.id IN :productIds AND " +
            ":currentTime >= dc.startDate AND " +
            ":currentTime <= dc.endDate AND " +
            "dc.usedCount < dc.maxUses " +
            "ORDER BY dc.priority DESC, dc.discountValue DESC")
    List<DiscountCode> findValidProductDiscountCodes(@Param("storeId") Long storeId,
                                                     @Param("productIds") List<Long> productIds,
                                                     @Param("currentTime") LocalDateTime currentTime);

    // Tìm tất cả voucher có thể áp dụng (shop + products)
    @Query("SELECT dc FROM DiscountCode dc " +
            "LEFT JOIN dc.products p " +
            "WHERE dc.store.id = :storeId AND " +
            "dc.isActive = true AND " +
            ":currentTime >= dc.startDate AND " +
            ":currentTime <= dc.endDate AND " +
            "dc.usedCount < dc.maxUses AND " +
            "(dc.appliesTo = 'SHOP' OR " +
            " (dc.appliesTo = 'PRODUCTS' AND p.id IN :productIds)) " +
            "ORDER BY dc.priority DESC, dc.discountValue DESC")
    List<DiscountCode> findAllValidDiscountCodes(@Param("storeId") Long storeId,
                                                 @Param("productIds") List<Long> productIds,
                                                 @Param("currentTime") LocalDateTime currentTime);

    // Tìm voucher auto-apply
    @Query("SELECT dc FROM DiscountCode dc " +
            "LEFT JOIN dc.products p " +
            "WHERE dc.store.id = :storeId AND " +
            "dc.isActive = true AND " +
            "dc.autoApply = true AND " +
            ":currentTime >= dc.startDate AND " +
            ":currentTime <= dc.endDate AND " +
            "dc.usedCount < dc.maxUses AND " +
            "(dc.appliesTo = 'SHOP' OR " +
            " (dc.appliesTo = 'PRODUCTS' AND p.id IN :productIds)) " +
            "ORDER BY dc.priority DESC, dc.discountValue DESC")
    List<DiscountCode> findAutoApplyDiscountCodes(@Param("storeId") Long storeId,
                                                  @Param("productIds") List<Long> productIds,
                                                  @Param("currentTime") LocalDateTime currentTime);

    // Tìm voucher sắp hết hạn
    @Query("SELECT dc FROM DiscountCode dc WHERE " +
            "dc.isActive = true AND " +
            "dc.endDate BETWEEN :startTime AND :endTime")
    List<DiscountCode> findDiscountCodesExpiringSoon(@Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime);

    // Tìm voucher theo applies_to
    List<DiscountCode> findByStoreIdAndAppliesToAndIsActiveTrue(Long storeId, AppliesTo appliesTo);

    // Search voucher
    @Query("SELECT dc FROM DiscountCode dc WHERE " +
            "dc.store.id = :storeId AND " +
            "(LOWER(dc.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            " LOWER(dc.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<DiscountCode> searchDiscountCodes(@Param("storeId") Long storeId,
                                           @Param("keyword") String keyword,
                                           Pageable pageable);

    // ===== MODIFICATION METHODS =====

    // Cập nhật số lượng đã sử dụng
    @Modifying
    @Query("UPDATE DiscountCode dc SET dc.usedCount = dc.usedCount + 1 WHERE dc.id = :discountCodeId")
    void incrementUsedCount(@Param("discountCodeId") Long discountCodeId);

    // Kích hoạt/vô hiệu hóa voucher
    @Modifying
    @Query("UPDATE DiscountCode dc SET dc.isActive = :isActive WHERE dc.id = :discountCodeId")
    void updateActiveStatus(@Param("discountCodeId") Long discountCodeId, @Param("isActive") Boolean isActive);

    // ===== STATISTICS METHODS =====

    // Thống kê voucher theo store
    @Query("SELECT " +
            "dc.discountType as type, " +
            "COUNT(dc) as totalCount, " +
            "SUM(dc.usedCount) as totalUsed, " +
            "SUM(CASE WHEN dc.isActive = true THEN 1 ELSE 0 END) as activeCount " +
            "FROM DiscountCode dc " +
            "WHERE dc.store.id = :storeId " +
            "GROUP BY dc.discountType")
    List<Object[]> getDiscountStatsByStore(@Param("storeId") Long storeId);

    // Đếm voucher active theo store
    @Query("SELECT COUNT(dc) FROM DiscountCode dc WHERE dc.store.id = :storeId AND dc.isActive = true")
    Long countActiveDiscountCodesByStore(@Param("storeId") Long storeId);

    // Đếm voucher hết hạn
    @Query("SELECT COUNT(dc) FROM DiscountCode dc WHERE dc.store.id = :storeId AND dc.endDate < :currentTime")
    Long countExpiredDiscountCodesByStore(@Param("storeId") Long storeId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT DISTINCT dc FROM DiscountCode dc " +
            "LEFT JOIN FETCH dc.products p " +
            "WHERE dc.store.id = :storeId " +
            "AND dc.isActive = true " +
            "AND dc.startDate <= :currentTime " +
            "AND dc.endDate >= :currentTime " +
            "AND dc.usedCount < dc.maxUses " +
            "AND (dc.appliesTo = 'SHOP' OR " +
            "     (dc.appliesTo = 'PRODUCTS' AND p.id IN :productIds)) " +
            "ORDER BY dc.priority DESC, dc.discountValue DESC")
    List<DiscountCode> findAllValidDiscountCodesWithProducts(
            @Param("storeId") Long storeId,
            @Param("productIds") List<Long> productIds,
            @Param("currentTime") LocalDateTime currentTime);


}