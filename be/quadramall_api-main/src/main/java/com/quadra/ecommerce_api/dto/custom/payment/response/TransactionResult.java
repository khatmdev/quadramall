package com.quadra.ecommerce_api.dto.custom.payment.response;

import com.quadra.ecommerce_api.dto.base.payment.PaymentTransactionDTO;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import lombok.Data;

@Data
public class TransactionResult {
        private PaymentTransactionDTO paymentTransaction;
        private String message;
}
