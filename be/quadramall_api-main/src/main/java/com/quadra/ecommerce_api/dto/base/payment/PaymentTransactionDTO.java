package com.quadra.ecommerce_api.dto.base.payment;

import com.quadra.ecommerce_api.dto.base.order.OrderDTO;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.payment.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentTransactionDTO {
    private Long id;
    private OrderDTO order;
    private String gatewayName;
    private PaymentMethod method;
    private TransactionType type;
    private TransactionStatus status;
    private BigDecimal amount;
    private String currencyCode;
    private String transactionCode;
    private String gatewayResponse;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
