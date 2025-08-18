package com.quadra.ecommerce_api.repository.wallet;

import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.entity.wallet.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletTransactionRepo  extends JpaRepository<WalletTransaction, Long> {
    Optional<WalletTransaction> findByWalletId(long l);
}
