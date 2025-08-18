package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Attribute;
import com.quadra.ecommerce_api.entity.product.AttributeValue;
import com.quadra.ecommerce_api.entity.product.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeValueRepo extends JpaRepository<AttributeValue, Long> {

    @Query("SELECT pd FROM ProductDetail pd " +
            "JOIN FETCH pd.attributeValue av " +
            "JOIN FETCH av.attribute " +
            "WHERE pd.variant.id = :variantId")
    List<ProductDetail> findByVariantId(Long variantId);

    @Query("SELECT av FROM AttributeValue av WHERE av.attribute = :attribute AND LOWER(av.value) = LOWER(:value)")
    Optional<AttributeValue> findByAttributeAndValueIgnoreCase(@Param("attribute") Attribute attribute, @Param("value") String value);
}
