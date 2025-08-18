package com.quadra.ecommerce_api.dto.custom.payment.response;

import com.quadra.ecommerce_api.dto.base.wallet.WalletTransactionDTO;
import lombok.Data;

@Data
public class DepositResponse {

    private WalletTransactionDTO walletTransactionDTO;
    private String message;

}
