package com.quadra.ecommerce_api.repository.product;


import com.quadra.ecommerce_api.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductStatsRepo extends JpaRepository<Product, Long> {


    @Query("SELECT " +
            "COALESCE(COUNT(DISTINCT oi.order.id), 0), " +
            "COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN 1 ELSE 0 END), 0), " +
            "COALESCE(COUNT(DISTINCT oi.order.id), 0), " +
            "COALESCE(AVG(pr.rating), 0), " +
            "COALESCE(SUM(oi.quantity * oi.priceAtTime), 0) " +
            "FROM Product p " +
            "JOIN p.store s " +
            "LEFT JOIN ProductVariant pv ON p.id = pv.product.id " +
            "LEFT JOIN OrderItem oi ON pv.id = oi.variant.id " +
            "LEFT JOIN oi.order o " +
            "LEFT JOIN ProductReview pr ON oi.id = pr.orderItem.id " +
            "WHERE s.id = :storeId " +
            "GROUP BY s.id")
    Object[] findProductStatsByStoreId(@Param("storeId") Long storeId);
}
