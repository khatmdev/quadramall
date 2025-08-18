package com.quadra.ecommerce_api.repository.shipping;

import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderShippingRepo extends JpaRepository<OrderShipping, Long> {
    OrderShipping findByOrder(Order order);
}
