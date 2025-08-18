package com.quadra.ecommerce_api.dto.base.shipping;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShippingPartnerDTO {
    private Long id;
    private String name;
    private String apiEndpoint;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
