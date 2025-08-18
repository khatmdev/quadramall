package com.quadra.ecommerce_api.dto.custom.orderManagerment.response;

import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private OrderStatus status;
    private ShippingMethod shippingMethod;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Customer Info
    private CustomerInfoResponse customer;

    // Shipping Info
    private OrderShippingInfoResponse shipping;

    // Items
    private List<OrderItemDetailResponse> items;

    // Status Control
    private boolean canUpdateStatus;
    private List<OrderStatus> availableStatuses;

    // Timeline
    private List<OrderTimelineResponse> timeline;
}