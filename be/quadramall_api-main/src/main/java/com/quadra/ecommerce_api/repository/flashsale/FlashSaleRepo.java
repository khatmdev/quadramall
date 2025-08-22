package com.quadra.ecommerce_api.repository.flashsale;

import com.quadra.ecommerce_api.entity.discount.FlashSale;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepo extends JpaRepository<FlashSale, Long> {

    @Query("""
                SELECT fs FROM FlashSale fs
                WHERE fs.startTime <= CURRENT_TIMESTAMP
                  AND fs.endTime >= CURRENT_TIMESTAMP
                  AND fs.quantity > fs.soldCount
                  AND fs.product.isActive = true
                  AND fs.product.isActive = true
                  AND fs.product.store.status = 'ACTIVE'
            """)
    Page<FlashSale> findActiveFlashSales(Pageable pageable);

    @Query("""
                SELECT fs FROM FlashSale fs
                WHERE fs.product.store.id = :storeId
                  AND fs.product.isActive = true
                  AND fs.product.store.status = 'ACTIVE'
            """)
    Page<FlashSale> findByProductStoreId(@Param("storeId") Long storeId, Pageable pageable);

    @Query("""
                SELECT fs FROM FlashSale fs
                WHERE fs.id = :id
                  AND fs.product.store.id = :storeId
                  AND fs.product.isActive = true
                  AND fs.product.store.status = 'ACTIVE'
            """)
    Optional<FlashSale> findByIdAndProductStoreId(@Param("id") Long id, @Param("storeId") Long storeId);

    @Query("""
                SELECT fs FROM FlashSale fs
                WHERE fs.product.id = :productId
                  AND fs.startTime <= CURRENT_TIMESTAMP
                  AND fs.endTime >= CURRENT_TIMESTAMP
                  AND fs.quantity > fs.soldCount
                  AND fs.product.isActive = true
                  AND fs.product.store.status = 'ACTIVE'
            """)
    Optional<FlashSale> findActiveByProduct_Id(@Param("productId") Long productId);

    @Query("""
                SELECT fs FROM FlashSale fs
                WHERE fs.product.id IN :productIds
                  AND fs.startTime <= CURRENT_TIMESTAMP
                  AND fs.endTime >= CURRENT_TIMESTAMP
                  AND fs.quantity > fs.soldCount
                  AND fs.product.isActive = true
                  AND fs.product.store.status = 'ACTIVE'
            """)
    List<FlashSale> findActiveFlashSalesByProductIds(@Param("productIds") List<Long> productIds);

    // ✅ THÊM METHOD NÀY ĐỂ UPDATE CHỈ SOLD_COUNT MÀ KHÔNG TRIGGER VALIDATION
    @Modifying
    @Transactional
    @Query("UPDATE FlashSale fs SET fs.soldCount = :newSoldCount WHERE fs.id = :flashSaleId")
    void updateSoldCount(@Param("flashSaleId") Long flashSaleId, @Param("newSoldCount") Integer newSoldCount);

    // ✅ OPTIONAL: Method để increment sold count một cách atomic
    @Modifying
    @Transactional
    @Query("UPDATE FlashSale fs SET fs.soldCount = fs.soldCount + :increment WHERE fs.id = :flashSaleId")
    void incrementSoldCount(@Param("flashSaleId") Long flashSaleId, @Param("increment") Integer increment);

    // ✅ OPTIONAL: Method để decrement sold count một cách atomic và đảm bảo không âm
    @Modifying
    @Transactional
    @Query("UPDATE FlashSale fs SET fs.soldCount = CASE WHEN fs.soldCount >= :decrement THEN fs.soldCount - :decrement ELSE 0 END WHERE fs.id = :flashSaleId")
    void decrementSoldCount(@Param("flashSaleId") Long flashSaleId, @Param("decrement") Integer decrement);
}
