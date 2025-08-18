package com.quadra.ecommerce_api.dto.base.order;

import com.quadra.ecommerce_api.dto.base.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.base.store.StoreDTO;
import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private UserDTO customer;
    private StoreDTO store;
    private OrderStatus status;
    private ShippingMethod shippingMethod;
    private PaymentMethod paymentMethod;
    private DiscountCodeDTO discountCode;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
