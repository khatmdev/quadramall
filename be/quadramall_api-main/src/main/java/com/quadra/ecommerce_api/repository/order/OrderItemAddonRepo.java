package com.quadra.ecommerce_api.repository.order;

import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.order.OrderItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemAddonRepo extends JpaRepository<OrderItemAddon, Long> {
    List<OrderItemAddon> findByOrderItem(OrderItem orderItem);
}
