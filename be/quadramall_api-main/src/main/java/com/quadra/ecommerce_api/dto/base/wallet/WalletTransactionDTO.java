package com.quadra.ecommerce_api.dto.base.wallet;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletTransactionDTO {
    private Long id;
    private WalletDTO walletDto;
    private String type;
    private BigDecimal amount;
    private String status;
    private String description;
    private String paymentMethod;
    private String externalTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String referenceType;
    private Long referenceId;
    private Long transferId;
}