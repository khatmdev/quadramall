package com.quadra.ecommerce_api.dto.custom.payment.response;

import com.quadra.ecommerce_api.entity.order.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResult {
    private String txnRef;
    private String status;
    private String message;
}
