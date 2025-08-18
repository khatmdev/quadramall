package com.quadra.ecommerce_api.dto.custom.shipping.response;


import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeliveryTimelineDTO {
    private DeliveryStatus status;
    private String description;
    private LocalDateTime timestamp;
    private String notes;
}