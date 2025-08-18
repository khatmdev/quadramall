package com.quadra.ecommerce_api.dto.base.wallet;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletDTO {
    private Long id;
    private UserDTO user;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}