package com.quadra.ecommerce_api.dto.custom.shipping.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectShipperRequest {
    @NotBlank(message = "Lý do từ chối không được để trống")
    private String rejectionReason;
}