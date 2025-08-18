package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeRepo extends JpaRepository<Attribute, Long> {
    @Query("SELECT DISTINCT a FROM Attribute a " +
            "JOIN AttributeValue av ON a.id = av.attribute.id " +
            "JOIN ProductDetail pd ON av.id = pd.attributeValue.id " +
            "JOIN ProductVariant pv ON pd.variant.id = pv.id " +
            "WHERE pv.product.id = :productId")
    List<Attribute> findByProductIdThroughDetails(@Param("productId") Long productId);

    @Query("SELECT a FROM Attribute a WHERE LOWER(a.name) = LOWER(:name)")
    Optional<Attribute> findByNameIgnoreCase(@Param("name") String name);
}
