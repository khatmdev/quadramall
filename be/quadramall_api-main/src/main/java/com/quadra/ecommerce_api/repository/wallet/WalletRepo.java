package com.quadra.ecommerce_api.repository.wallet;

import com.quadra.ecommerce_api.dto.custom.wallet.response.TransactionHistory;
import com.quadra.ecommerce_api.dto.custom.wallet.response.WalletDashboardResponse;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepo  extends JpaRepository<Wallet, Long> {
    Wallet findByUserId(Long id);

    @Query(value = """
        SELECT 
            w.balance AS balance,
            w.updated_at AS updatedAt,
            COALESCE((
                SELECT SUM(wt.amount)
                FROM wallet_transactions wt
                WHERE wt.wallet_id = w.id
                AND wt.type IN ('TOP_UP', 'REFUND', 'TRANSFER_IN', 'BANK_DEPOSIT')
                AND wt.status = 'COMPLETED'
                AND YEAR(wt.created_at) = YEAR(CURRENT_DATE)
                AND MONTH(wt.created_at) = MONTH(CURRENT_DATE)
            ), 0) AS currentMonthDeposit,
            COALESCE((
                SELECT SUM(wt.amount)
                FROM wallet_transactions wt
                WHERE wt.wallet_id = w.id
                AND wt.type IN ('TOP_UP', 'REFUND', 'TRANSFER_IN', 'BANK_DEPOSIT')
                AND wt.status = 'COMPLETED'
                AND YEAR(wt.created_at) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                AND MONTH(wt.created_at) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
            ), 0) AS previousMonthDeposit,
            COALESCE((
                SELECT SUM(wt.amount)
                FROM wallet_transactions wt
                WHERE wt.wallet_id = w.id
                AND wt.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER_OUT', 'BANK_WITHDRAWAL')
                AND wt.status = 'COMPLETED'
                AND YEAR(wt.created_at) = YEAR(CURRENT_DATE)
                AND MONTH(wt.created_at) = MONTH(CURRENT_DATE)
            ), 0) AS currentMonthExpense,
            COALESCE((
                SELECT SUM(wt.amount)
                FROM wallet_transactions wt
                WHERE wt.wallet_id = w.id
                AND wt.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER_OUT', 'BANK_WITHDRAWAL')
                AND wt.status = 'COMPLETED'
                AND YEAR(wt.created_at) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                AND MONTH(wt.created_at) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
            ), 0) AS previousMonthExpense
        FROM wallets w
        WHERE w.user_id = :userId
        """, nativeQuery = true)
    Optional<WalletDashboardResponse> findWalletDashboardByUserId(Long userId);

    @Query(value = """
        SELECT 
            wt.id AS transactionId,
            wt.type AS type,
            wt.status AS status,
            wt.description AS description,
            wt.amount AS amount,
            wt.updated_at AS updatedAt
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = :userId
        ORDER BY wt.created_at DESC
        LIMIT 5
        """, nativeQuery = true)
    List<TransactionHistory> findTop5RecentTransactionsByUserId(Long userId);

    @Query(value = """
        SELECT 
            wt.id AS transactionId,
            wt.type AS type,
            wt.status AS status,
            wt.description AS description,
            wt.amount AS amount,
            wt.updated_at AS updatedAt
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = :userId
        ORDER BY wt.created_at DESC
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = :userId
        """,
            nativeQuery = true)
    Page<TransactionHistory> findTransactionsByUserId(Long userId, Pageable pageable);

    @Query(value = """
        SELECT 
            wt.id AS transactionId,
            wt.type AS type,
            wt.status AS status,
            wt.description AS description,
            wt.amount AS amount,
            wt.updated_at AS updatedAt
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = :userId
        AND (:status IS NULL OR wt.status = :status)
        AND (:type IS NULL OR wt.type = :type)
        AND (:startDate IS NULL OR wt.created_at >= :startDate)
        AND (:endDate IS NULL OR wt.created_at <= :endDate)
        ORDER BY wt.created_at DESC
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE w.user_id = :userId
        AND (:status IS NULL OR wt.status = :status)
        AND (:type IS NULL OR wt.type = :type)
        AND (:startDate IS NULL OR wt.created_at >= :startDate)
        AND (:endDate IS NULL OR wt.created_at <= :endDate)
        """,
            nativeQuery = true)
    Page<TransactionHistory> findTransactionsByUserIdAndFilters(Long userId, String status, String type,
                                                                LocalDateTime startDate, LocalDateTime endDate,
                                                                Pageable pageable);
}
