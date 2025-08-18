package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.AddonGroup;
import com.quadra.ecommerce_api.entity.product.Product;
import org.checkerframework.checker.units.qual.A;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddonGroupRepo extends JpaRepository<AddonGroup, Long> {

    List<AddonGroup> findByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM AddonGroup ag WHERE ag.product.id = :productId")
    void deleteByProductId(Long productId);
}
