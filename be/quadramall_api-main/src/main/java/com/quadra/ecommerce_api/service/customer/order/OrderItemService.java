package com.quadra.ecommerce_api.service.customer.order;

import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import java.util.List;

@Service
public class OrderItemService {
    public List<OrderItem> getOrderItemsByOrderId(Long orderId) {
        return orderItemRepo.findByOrderId(orderId);
    }

    private final OrderItemRepo orderItemRepo;

    @Autowired
    public OrderItemService(OrderItemRepo orderItemRepo) {
        this.orderItemRepo = orderItemRepo;
    }

    public  List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepo.findByOrderId(orderId);
    }

    public void save(OrderItem orderItem) {
        orderItemRepo.save(orderItem);
    }

    public void update(OrderItem orderItem) {
        orderItemRepo.saveAndFlush(orderItem);
    }

}
