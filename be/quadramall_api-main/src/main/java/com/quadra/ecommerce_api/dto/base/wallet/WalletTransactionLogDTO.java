package com.quadra.ecommerce_api.dto.base.wallet;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WalletTransactionLogDTO {
    private Long id;
    private Long walletTransactionId;
    private String walletProvider;
    private String status;
    private String responseData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}