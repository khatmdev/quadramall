package com.quadra.ecommerce_api.repository.order;

import com.quadra.ecommerce_api.entity.order.OrderDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDiscountRepository extends JpaRepository<OrderDiscount, Long> {

    @Query("SELECT od FROM OrderDiscount od WHERE od.order.id = :orderId")
    OrderDiscount findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT od FROM OrderDiscount od WHERE od.order.id IN :orderIds")
    List<OrderDiscount> findByOrderIds(@Param("orderIds") List<Long> orderIds);

    @Query("SELECT od FROM OrderDiscount od WHERE od.discountCode.id = :discountCodeId")
    List<OrderDiscount> findByDiscountCodeId(@Param("discountCodeId") Long discountCodeId);
}