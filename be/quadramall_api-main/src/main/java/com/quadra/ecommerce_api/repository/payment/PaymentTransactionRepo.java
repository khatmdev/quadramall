package com.quadra.ecommerce_api.repository.payment;

import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepo extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByOrderId(Long orderId);
    Optional<PaymentTransaction> findByOrderIdAndTransactionCode(Long orderId, String transactionCode);

    boolean existsByTransactionCode(String txnRef);
}
