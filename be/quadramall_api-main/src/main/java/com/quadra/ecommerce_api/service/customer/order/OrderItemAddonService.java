package com.quadra.ecommerce_api.service.customer.order;

import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.order.OrderItemAddon;
import com.quadra.ecommerce_api.repository.order.OrderItemAddonRepo;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemAddonService {

    private final OrderItemAddonRepo orderItemAddonRepo;

    @Autowired
    public OrderItemAddonService(OrderItemAddonRepo orderItemAddonRepo) {
            this.orderItemAddonRepo = orderItemAddonRepo;
    }

    public void save(OrderItemAddon orderItemAddon) {
        orderItemAddonRepo.save(orderItemAddon);
    }

    // Thêm method này vào OrderItemAddonService
    public List<OrderItemAddon> getByOrderItem(OrderItem orderItem) {

        return orderItemAddonRepo.findByOrderItem(orderItem);
    }

}
