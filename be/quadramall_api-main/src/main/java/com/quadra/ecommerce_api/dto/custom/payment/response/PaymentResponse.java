package com.quadra.ecommerce_api.dto.custom.payment.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String redirectUrl; // Dành cho VNPay
    private TransactionResult transactionResult; // Dành cho COD và WALLET


}
