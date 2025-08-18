package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.AttributeValue;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepo extends JpaRepository<ProductVariant, Long> {

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.isActive = true")
        List<ProductVariant> findVariantsByProductId(Long productId);

    @Query("SELECT av FROM ProductVariant pv " +
            "JOIN ProductDetail pd ON pd.variant.id = pv.id " +
            "JOIN AttributeValue av ON av.id = pd.attributeValue.id " +
            "WHERE pv.product.id = :productId AND pv.isActive = true")
    List<AttributeValue> findAttributeValuesByProductId(Long productId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.isActive = true")
    List<ProductVariant> findByProductIdAndIsActiveTrue(@Param("productId") Long productId);

    @Query("SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.isActive = true")
    Optional<BigDecimal> findMinPriceByProductId(@Param("productId") Long productId);

    @Query("SELECT MAX(pv.price) FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.isActive = true")
    Optional<BigDecimal> findMaxPriceByProductId(@Param("productId") Long productId);

    @Query("""
        SELECT SUM(pv.stockQuantity) FROM ProductVariant pv
        WHERE pv.product.id = :productId
          AND pv.isActive = true
    """)
    Integer getTotalStockByProductId(@Param("productId") Long productId);

    boolean existsBySku(String sku);


    List<ProductVariant> findByProductId(Long productId);


    List<ProductVariant> findByProduct(Product product);

    ProductVariant findBySku(String sku);

    @Modifying
    @Query("DELETE FROM ProductVariant pv WHERE pv.product.id = :productId")
    void deleteByProductId(Long productId);

    boolean existsBySkuAndIdNot(String sku, Long id);

    public Optional<ProductVariant> findById(Long aLong);

    List<ProductVariant> findByProductIdInAndIsActiveTrue(List<Long> productIds);
}
