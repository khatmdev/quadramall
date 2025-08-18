package com.quadra.ecommerce_api.dto.custom.wallet.response;

import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class WalletDashboardResponse {

    private BigDecimal balance;
    private Timestamp updatedAt;

    private BigDecimal currentMonthDeposit;
    private BigDecimal previousMonthDeposit;
    private BigDecimal currentMonthExpense;
    private BigDecimal previousMonthExpense;

    private List<TransactionHistory> transactionHistory;

    public WalletDashboardResponse(BigDecimal balance, Timestamp updatedAt,
                                   BigDecimal currentMonthDeposit, BigDecimal previousMonthDeposit,
                                   BigDecimal currentMonthExpense, BigDecimal previousMonthExpense) {
        this.balance = balance;
        this.updatedAt = updatedAt;
        this.currentMonthDeposit = currentMonthDeposit;
        this.previousMonthDeposit = previousMonthDeposit;
        this.currentMonthExpense = currentMonthExpense;
        this.previousMonthExpense = previousMonthExpense;
    }

}
