package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.store s " +
            "WHERE p.slug = :slug AND p.isActive = true")
    Optional<Product> findBySlugAndIsActiveTrue(@Param("slug") String slug);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.store.id = :storeId AND p.isActive = true")
    Long countByStoreIdAndIsActiveTrue(@Param("storeId") Long storeId);

    Page<Product> findAll(Pageable pageable);

    @Query("SELECT p FROM Product p " +
            "WHERE p.store.id = :storeId AND p.store.owner.id = :ownerId AND p.isActive = true")
    List<Product> findByStoreIdAndOwnerId(@Param("storeId") Long storeId, @Param("ownerId") Long ownerId);


    @Query("SELECT p.id, p.name, p.isActive, " +
            "MIN(pv.price), MAX(pv.price), SUM(pv.stockQuantity), COALESCE(SUM(oi.quantity), 0) " +
            "FROM Product p " +
            "LEFT JOIN ProductVariant pv ON p.id = pv.product.id " +
            "LEFT JOIN OrderItem oi ON pv.id = oi.variant.id " +
            "WHERE p.store.id = :storeId " +
            "GROUP BY p.id, p.name, p.isActive")
    List<Object[]> findProductDataByStoreId(@Param("storeId") Long storeId);

    @Query("""
                SELECT p FROM Product p
                WHERE p.store.id = :storeId
                  AND p.isActive = true
                  AND p.store.status = 'ACTIVE'
                  AND (:searchQuery IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchQuery, '%')))
            """)
    Page<Product> findByStoreIdAndSearchQuery(
            @Param("storeId") Long storeId,
            @Param("searchQuery") String searchQuery,
            Pageable pageable
    );

    Optional<Product> findByIdAndIsActiveTrue(Long id);

    List<Product> findByStoreIdAndIsActiveTrue(Long storeId);


    @Query("SELECT p FROM Product p WHERE p.store.id = :storeId AND p.isActive = true " +
            "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'comprehensive' THEN p.id END, " +
            "CASE WHEN :sort = 'best_selling' THEN (SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.variant.product.id = p.id) END DESC, " +
            "CASE WHEN :sort = 'newest' THEN p.createdAt END DESC, " +
            "CASE WHEN :sort = 'price_asc' THEN (SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.id = p.id) END ASC, " +
            "CASE WHEN :sort = 'price_desc' THEN (SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.id = p.id) END DESC")
    Page<Product> findByStoreIdAndFilters(
            @Param("storeId") Long storeId,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("sort") String sort,
            Pageable pageable
    );

    @Query("""
        SELECT p, 
               (SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.id = p.id AND pv.isActive = true) as minPrice,
               (SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.variant.product.id = p.id AND oi.order.status = 'DELIVERED') as soldCount,
               (SELECT COALESCE(AVG(pr.rating), 0) FROM ProductReview pr JOIN pr.orderItem oi JOIN oi.variant v WHERE v.product.id = p.id AND pr.rating IS NOT NULL) as rating
        FROM Product p
        JOIN FETCH p.store s
        WHERE (:itemTypeIds IS NULL OR p.itemType.id IN :itemTypeIds)
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:province IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :province, '%')))
          AND EXISTS (
              SELECT 1 FROM ProductVariant pv2
              WHERE pv2.product.id = p.id AND pv2.isActive = true
                AND (:priceMin IS NULL OR pv2.price >= :priceMin)
                AND (:priceMax IS NULL OR pv2.price <= :priceMax)
          )
    """)
    Page<Object[]> searchProducts(
            @Param("itemTypeIds") List<Long> itemTypeIds,
            @Param("keyword") String keyword,
            @Param("province") String province,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.store.id = :storeId AND p.isActive = true AND p.category.id IS NULL")
    List<Product> findUncategorizedByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT p FROM Product p WHERE p.store.id = :storeId AND p.category.id = :categoryId AND p.isActive = true")
    List<Product> findByStoreIdAndCategoryIdAndIsActiveTrue(@Param("storeId") Long storeId, @Param("categoryId") Long categoryId);

    /**
     * Lấy sản phẩm active theo store và owner
     */
    @Query("SELECT p FROM Product p " +
            "WHERE p.store.id = :storeId AND p.store.owner.id = :ownerId AND p.isActive = true")
    List<Product> findActiveByStoreIdAndOwnerId(@Param("storeId") Long storeId, @Param("ownerId") Long ownerId);

    /**
     * Lấy sản phẩm inactive theo store và owner
     */
    @Query("SELECT p FROM Product p " +
            "WHERE p.store.id = :storeId AND p.store.owner.id = :ownerId AND p.isActive = false")
    List<Product> findInactiveByStoreIdAndOwnerId(@Param("storeId") Long storeId, @Param("ownerId") Long ownerId);

    /**
     * Lấy tất cả sản phẩm (cả active và inactive) theo store và owner
     */
    @Query("SELECT p FROM Product p " +
            "WHERE p.store.id = :storeId AND p.store.owner.id = :ownerId")
    List<Product> findAllByStoreIdAndOwnerId(@Param("storeId") Long storeId, @Param("ownerId") Long ownerId);



}