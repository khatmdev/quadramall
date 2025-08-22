package com.quadra.ecommerce_api.dto.custom.payment.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResult {
    private String txnRef;
    private String status;
    private String message;
}
