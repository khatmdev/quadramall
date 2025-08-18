package com.quadra.ecommerce_api.service.wallet;

import com.quadra.ecommerce_api.config.payment.VNPayConfig;
import com.quadra.ecommerce_api.dto.base.payment.PaymentTransactionDTO;
import com.quadra.ecommerce_api.dto.base.wallet.WalletDTO;
import com.quadra.ecommerce_api.dto.base.wallet.WalletTransactionDTO;
import com.quadra.ecommerce_api.dto.custom.payment.request.DepositRequest;
import com.quadra.ecommerce_api.dto.custom.payment.response.DepositResponse;
import com.quadra.ecommerce_api.dto.custom.payment.response.TransactionResult;
import com.quadra.ecommerce_api.dto.custom.wallet.response.TransactionHistory;
import com.quadra.ecommerce_api.dto.custom.wallet.response.WalletDashboardResponse;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.entity.wallet.WalletTransaction;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.payment.TransactionType;
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionStatus;
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionType;
import com.quadra.ecommerce_api.exception.payment.VnPayException;
import com.quadra.ecommerce_api.mapper.base.payment.PaymentTransactionMapper;
import com.quadra.ecommerce_api.mapper.base.wallet.WalletTransactionMapper;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.payment.PaymentTransactionRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletTransactionRepo;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import com.quadra.ecommerce_api.utils.payment.ErrorMessageService;
import com.quadra.ecommerce_api.utils.payment.VNPayUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepo walletRepo;
    private final WalletTransactionMapper walletTransactionMapper;
    private final WalletTransactionRepo walletTransactionRepo;
    private final NotificationService notificationService;



    // Lấy số dư cho ví
    public Wallet getWalletByUser(User user) {
        return walletRepo.findByUserId(user.getId());
    }

    @Transactional
    public void save(Wallet wallet) {
        walletRepo.save(wallet);
    }


    // Dashboard
    @Transactional
    public WalletDashboardResponse getWalletDashboard(Long userId   ) {
        WalletDashboardResponse walletDashboardResponse = walletRepo
                .findWalletDashboardByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
        List<TransactionHistory>  transactionHistory = walletRepo
                .findTop5RecentTransactionsByUserId(userId);

        walletDashboardResponse.setTransactionHistory(transactionHistory);

        return walletDashboardResponse;
    }

    // Tất cả giao dịch có phân trang và option lọc
    @Transactional
    public Page<TransactionHistory> getTransactionHistory(Long userId, String type, String status,
                                                          LocalDateTime startDate, LocalDateTime endDate,
                                                          Pageable pageable) {
        return walletRepo.findTransactionsByUserIdAndFilters(userId, status, type, startDate, endDate, pageable);
    }



    @Transactional
    public DepositResponse handleDeposit(Map<String, String> params) {
        String walletTransactionIdRsp = params.get("vnp_TxnRef");
        Long walletTransactionId = Long.valueOf(walletTransactionIdRsp);

        DepositResponse depositResponse = new DepositResponse();
        String message = "";


        Optional<WalletTransaction> walletTransaction = walletTransactionRepo.findById(walletTransactionId);
        Wallet wallet = walletTransaction.get().getWallet();
        if (walletTransaction.isEmpty()) {
             message = "Wallet transaction not found";
        }

        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            // Cập nhập trạng thái cho PaymentTransaction
            walletTransaction.ifPresent(transaction -> {
                transaction.setUpdatedAt(LocalDateTime.now());
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setExternalTransactionId(params.get("vnp_TmnCode"));
                walletTransactionRepo.save(transaction);

            });

            if(wallet != null){
                wallet.setBalance(wallet.getBalance().add(walletTransaction.get().getAmount()));
                wallet.setUpdatedAt(LocalDateTime.now());
                walletRepo.save(wallet);
                message = "Nạp tiền thành công";

                User user  = wallet.getUser();

                notificationService.sendNotification(
                        user,
                        NotificationType.ORDER_UPDATE,
                        "Nạp tiền thành công",
                        "Nạp tiền thành công: +"+ walletTransaction.get().getAmount() +"VND .Số dư: "+ wallet.getBalance() +"VND. Mã giao dịch: #" + params.get("vnp_TxnRef"),
                        walletTransactionId,
                        Notification.Priority.HIGH,
                        Notification.Category.PAYMENT,
                        "💳"
                );
            }

        }else{
            // Cập nhập trạng thái cho PaymentTransaction
            walletTransaction.ifPresent(transaction -> {
                transaction.setUpdatedAt(LocalDateTime.now());
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setExternalTransactionId(params.get("vnp_TmnCode"));
                walletTransactionRepo.save(transaction);

                User user  = wallet.getUser();

                notificationService.sendNotification(
                        user,
                        NotificationType.ORDER_UPDATE,
                        "Nạp tiền thất bại",
                        "Đã phát sinh lỗi. Vui lòng chọn phương thức nạp khác "+ walletTransaction.get().getAmount() +  "Mã giao dịch: " + params.get("vnp_TxnRef"),
                        walletTransactionId,
                        Notification.Priority.HIGH,
                        Notification.Category.PAYMENT,
                        "💳"
                );

            });
            message = "Giao dịch đã có lỗi xảy ra. Vui lòng thao tác lại.";
        }

        WalletTransactionDTO walletTransactionDTO = walletTransactionMapper.toDto(walletTransaction.get());

        DepositResponse depositResponseDTO = new DepositResponse();
        depositResponseDTO.setMessage(message);
        depositResponseDTO.setWalletTransactionDTO(walletTransactionDTO);

        return  depositResponseDTO;
    }
}
