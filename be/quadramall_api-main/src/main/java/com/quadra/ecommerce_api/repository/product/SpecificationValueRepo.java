package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.SpecificationValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecificationValueRepo extends JpaRepository<SpecificationValue, Long> {

    List<SpecificationValue> findByProductId(Long productId);

    List<SpecificationValue> findByProduct(Product product);


    @Modifying
    @Query("DELETE FROM SpecificationValue sv WHERE sv.product.id = :productId")
    void deleteByProductId(Long productId);

}
