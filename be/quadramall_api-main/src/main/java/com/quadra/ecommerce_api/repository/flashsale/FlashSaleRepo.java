package com.quadra.ecommerce_api.repository.flashsale;

import com.quadra.ecommerce_api.entity.discount.FlashSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
