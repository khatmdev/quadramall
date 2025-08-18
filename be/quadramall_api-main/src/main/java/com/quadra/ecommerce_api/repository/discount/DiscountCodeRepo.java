package com.quadra.ecommerce_api.repository.discount;

import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscountCodeRepo extends JpaRepository<DiscountCode, Long> {
    List<DiscountCode> findByStoreId(Long storeId);

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.store.id = :storeId AND dc.isActive = true AND dc.endDate >= CURRENT_DATE")
    List<DiscountCode> findByStoreIdAndIsActiveTrue(@Param("storeId") Long storeId);

    DiscountCode findByCode(String code);
}
