package com.quadra.ecommerce_api.dto.custom.shipping.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelDeliveryRequest {
    @NotBlank(message = "Lý do hủy không được để trống")
    private String cancellationReason;
}
