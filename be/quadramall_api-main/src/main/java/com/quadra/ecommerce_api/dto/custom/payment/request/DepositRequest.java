package com.quadra.ecommerce_api.dto.custom.payment.request;

import com.quadra.ecommerce_api.dto.custom.order.request.OrderRequest;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositRequest {

    private BigDecimal amount;
    private String paymentMethod;
    private OrderRequest orderRequest;

}
