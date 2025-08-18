package com.quadra.ecommerce_api.repository.order;

import com.quadra.ecommerce_api.entity.order.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepo extends JpaRepository<ProductReview, Long> {
    @Query("SELECT pr FROM ProductReview pr " +
            "JOIN FETCH pr.orderItem oi " +
            "JOIN FETCH oi.order o " +
            "JOIN FETCH o.customer u " +
            "JOIN FETCH oi.variant v " +
            "WHERE v.product.id = :productId")
    List<ProductReview> findByProductIdWithUser(@Param("productId") Long productId);

    @Query("SELECT AVG(pr.rating) FROM ProductReview pr JOIN pr.orderItem oi JOIN oi.variant v WHERE v.product.id = :productId AND pr.rating IS NOT NULL")
    Optional<Double> findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(pr) FROM ProductReview pr JOIN pr.orderItem oi JOIN oi.variant v WHERE v.product.id = :productId")
    Long countReviewsByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(pr.rating) FROM ProductReview pr " +
            "WHERE pr.orderItem.variant.product.store.id = :storeId")
    Optional<Double> findAverageRatingByStoreId(@Param("storeId") Long storeId);


    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.orderItem.variant.product.store.id = :storeId")
    long countByStoreId(Long storeId);

}
