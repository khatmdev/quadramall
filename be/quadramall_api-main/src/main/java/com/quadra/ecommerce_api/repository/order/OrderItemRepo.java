package com.quadra.ecommerce_api.repository.order;

import com.quadra.ecommerce_api.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.variant.product.id = :productId AND oi.order.status = 'DELIVERED'")
    Long calculateSoldCount(@Param("productId") Long productId);

    List<OrderItem> findByOrderId(Long orderId);


    // OrderManagement
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.id = :orderId")
    int countByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.variant v JOIN FETCH v.product WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderIdWithProductDetails(@Param("orderId") Long orderId);
}
