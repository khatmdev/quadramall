package com.quadra.ecommerce_api.service.customer.order;

import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.repository.shipping.OrderShippingRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderShippingService {
    private final OrderShippingRepo orderShippingRepo;


    @Transactional
    public void save(OrderShipping orderShipping) {
        orderShippingRepo.save(orderShipping);
    }

    public OrderShipping getByOrder (Order order) {
        return orderShippingRepo.findByOrder(order);
    }


}
