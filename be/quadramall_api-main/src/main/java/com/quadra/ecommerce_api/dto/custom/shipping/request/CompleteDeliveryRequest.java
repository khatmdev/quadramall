package com.quadra.ecommerce_api.dto.custom.shipping.request;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteDeliveryRequest {
    private String deliveryProofUrl;
    private String customerSignatureUrl;
    private String notes;

    @NotBlank(message = "Mã xác nhận không được để trống")
    private String confirmationCode;
}