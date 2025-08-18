package com.quadra.ecommerce_api.dto.custom.shipping.response;

import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DeliveryTrackingDTO {
    private Long orderId;
    private DeliveryStatus currentStatus;
    private String shipperName;
    private String shipperPhone;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime actualDelivery;
    private List<DeliveryTimelineDTO> timeline;
}