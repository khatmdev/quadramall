package com.quadra.ecommerce_api.repository.wallet;

import com.quadra.ecommerce_api.entity.wallet.WalletTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletTransactionLogRepo extends JpaRepository<WalletTransactionLog, Long> {
}