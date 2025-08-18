package com.quadra.ecommerce_api.dto.custom.shipping.request;

import lombok.Data;

import java.util.List;

@Data
public class ApproveShipperRequest {
    private String notes; // Optional notes for approval
}