package com.quadra.ecommerce_api.dto.custom.wallet.response;

import com.quadra.ecommerce_api.enums.wallet.WalletTransactionStatus;
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionHistory {
    private Long transactionId;
    private String type;
    private String status;
    private String description;
    private BigDecimal amount;
    private Timestamp updateAt;
}
