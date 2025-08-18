package com.quadra.ecommerce_api.dto.base.wallet;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LinkedWalletDTO {
    private Long id;
    private Long userId;
    private String walletProvider;
    private String walletId;
    private boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}