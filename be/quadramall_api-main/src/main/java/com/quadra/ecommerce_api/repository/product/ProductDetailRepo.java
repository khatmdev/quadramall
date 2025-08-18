package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDetailRepo extends JpaRepository<ProductDetail, Long> {

    @Query("SELECT pd FROM ProductDetail pd " +
            "JOIN FETCH pd.attributeValue av " +
            "JOIN FETCH av.attribute " +
            "WHERE pd.variant.id = :variantId")
    List<ProductDetail> findByVariantId(Long variantId);

    @Query("SELECT pd FROM ProductDetail pd WHERE pd.variant.id IN :variantIds")
    List<ProductDetail> findByVariantIds(List<Long> variantIds);

    @Query("SELECT pd FROM ProductDetail pd WHERE pd.variant.product.id = :productId")
    List<ProductDetail> findByProductId(@Param("productId") Long productId);

    void deleteByVariantId(Long variantId);

    List<ProductDetail> findByVariantIdIn(List<Long> variantIds);

    @Query("SELECT pd FROM ProductDetail pd WHERE pd.variant.product.id IN :productIds")
    List<ProductDetail> findByProductIdIn(@Param("productIds") List<Long> productIds);


}
