package com.quadra.ecommerce_api.service.payment;

import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.entity.wallet.WalletTransaction;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionType;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletTransactionRepo;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class BalanceTransferService {

    private final WalletRepo walletRepo;
    private final WalletTransactionRepo walletTransactionRepo;
    private final OrderRepo orderRepo;
    private final NotificationService notificationService;
    private final UserRepo userRepo;

    // Admin user ID (configure this based on your system)
    private static final Long ADMIN_USER_ID = 33L;
    private static final long AUTO_CONFIRM_DAYS = 3;

    /**
     * Transfer money to admin when order is paid (for WALLET/ONLINE payments)
     */
    @Transactional
    public void transferToAdminOnPayment(Order order) {
        if (order.getPaymentMethod() == PaymentMethod.COD) {
            log.info("Order {} is COD, skipping transfer to admin", order.getId());
            return;
        }

        User admin = userRepo.findById(ADMIN_USER_ID)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Admin user not found"));

        Wallet adminWallet = walletRepo.findByUserId(admin.getId());
        if (adminWallet == null) {
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Admin wallet not found");
        }

        BigDecimal amount = order.getTotalAmount();

        // Create transfer in transaction for admin
        WalletTransaction adminTransaction = new WalletTransaction();
        adminTransaction.setWallet(adminWallet);
        adminTransaction.setAmount(amount);
        adminTransaction.setType(WalletTransactionType.TRANSFER_IN);
        adminTransaction.setStatus(TransactionStatus.COMPLETED);
        adminTransaction.setDescription("Received payment for order #" + order.getId());
        adminTransaction.setReferenceId(order.getId());
        adminTransaction.setPaymentMethod(order.getPaymentMethod().toString());
        adminTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(adminTransaction);

        // Update admin wallet balance
        adminWallet.setBalance(adminWallet.getBalance().add(amount));
        walletRepo.save(adminWallet);

        log.info("Credited {} VND to admin for order {}", amount, order.getId());

        // Send notification to customer
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.PAYMENT_SUCCESS,
                "Thanh toán thành công",
                "Đã ghi nhận thanh toán " + amount + " VND cho đơn hàng #" + order.getId(),
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.PAYMENT,
                "💸"
        );
    }

    /**
     * Transfer money from admin to shop when order is CONFIRMED
     */
    @Transactional
    public void transferToShopOnConfirmed(Order order) {
        User admin = userRepo.findById(ADMIN_USER_ID)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Admin user not found"));
        User shopOwner = order.getStore().getOwner();

        Wallet adminWallet = walletRepo.findByUserId(admin.getId());
        Wallet shopWallet = walletRepo.findByUserId(shopOwner.getId());

        if (adminWallet == null || shopWallet == null) {
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Wallet not found for admin or shop");
        }

        BigDecimal amount = order.getTotalAmount();

        // Create transfer out transaction for admin
        WalletTransaction adminTransaction = new WalletTransaction();
        adminTransaction.setWallet(adminWallet);
        adminTransaction.setAmount(amount.negate());
        adminTransaction.setType(WalletTransactionType.TRANSFER_OUT);
        adminTransaction.setStatus(TransactionStatus.COMPLETED);
        adminTransaction.setDescription("Payment to shop for order #" + order.getId());
        adminTransaction.setReferenceId(order.getId());
        adminTransaction.setPaymentMethod(order.getPaymentMethod().toString());
        adminTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(adminTransaction);

        // Create transfer in transaction for shop
        WalletTransaction shopTransaction = new WalletTransaction();
        shopTransaction.setWallet(shopWallet);
        shopTransaction.setAmount(amount);
        shopTransaction.setType(WalletTransactionType.TRANSFER_IN);
        shopTransaction.setStatus(TransactionStatus.COMPLETED);
        shopTransaction.setDescription("Received payment for order #" + order.getId());
        shopTransaction.setReferenceId(order.getId());
        shopTransaction.setPaymentMethod(order.getPaymentMethod().toString());
        shopTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(shopTransaction);

        // Update wallet balances
        adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        shopWallet.setBalance(shopWallet.getBalance().add(amount));
        walletRepo.save(adminWallet);
        walletRepo.save(shopWallet);

        log.info("Transferred {} VND from admin to shop (ID: {}) for order {}",
                amount, shopOwner.getId(), order.getId());

        // Send notifications
        notificationService.sendNotification(
                shopOwner,
                NotificationType.PAYMENT_SUCCESS,
                "Nhận tiền thành công",
                "Đã nhận " + amount + " VND từ đơn hàng #" + order.getId(),
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.PAYMENT,
                "💰"
        );
    }

    /**
     * Refund money to customer when order is cancelled (for WALLET/ONLINE payments)
     */
    @Transactional
    public void refundToCustomer(Order order) {
        if (order.getPaymentMethod() == PaymentMethod.COD) {
            log.info("Order {} is COD, no refund needed", order.getId());
            return;
        }

        if (!List.of(OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.CONFIRMED_PREPARING)
                .contains(order.getStatus())) {
            throw new ExCustom(HttpStatus.BAD_REQUEST,
                    "Không thể hủy khi đơn hàng ở trạng thái " + order.getStatus());
        }

        User customer = order.getCustomer();
        User admin = userRepo.findById(ADMIN_USER_ID)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Admin user not found"));

        Wallet customerWallet = walletRepo.findByUserId(customer.getId());
        Wallet adminWallet = walletRepo.findByUserId(admin.getId());

        if (customerWallet == null || adminWallet == null) {
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Wallet not found for customer or admin");
        }

        BigDecimal amount = order.getTotalAmount();

        // Create transfer out transaction for admin
        WalletTransaction adminTransaction = new WalletTransaction();
        adminTransaction.setWallet(adminWallet);
        adminTransaction.setAmount(amount.negate());
        adminTransaction.setType(WalletTransactionType.TRANSFER_OUT);
        adminTransaction.setStatus(TransactionStatus.COMPLETED);
        adminTransaction.setDescription("Refund for cancelled order #" + order.getId());
        adminTransaction.setReferenceId(order.getId());
        adminTransaction.setPaymentMethod(order.getPaymentMethod().toString());
        adminTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(adminTransaction);

        // Create transfer in transaction for customer
        WalletTransaction customerTransaction = new WalletTransaction();
        customerTransaction.setWallet(customerWallet);
        customerTransaction.setAmount(amount);
        customerTransaction.setType(WalletTransactionType.REFUND);
        customerTransaction.setStatus(TransactionStatus.COMPLETED);
        customerTransaction.setDescription("Refund for cancelled order #" + order.getId());
        customerTransaction.setReferenceId(order.getId());
        customerTransaction.setPaymentMethod(order.getPaymentMethod().toString());
        customerTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(customerTransaction);

        // Update wallet balances
        adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        customerWallet.setBalance(customerWallet.getBalance().add(amount));
        walletRepo.save(adminWallet);
        walletRepo.save(customerWallet);

        log.info("Refunded {} VND to customer (ID: {}) for cancelled order {}",
                amount, customer.getId(), order.getId());

        // Send notifications
        notificationService.sendNotification(
                customer,
                NotificationType.PAYMENT_SUCCESS,
                "Hoàn tiền thành công",
                "Đã hoàn " + amount + " VND cho đơn hàng #" + order.getId(),
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.PAYMENT,
                "💸"
        );
    }

    /**
     * Automatically confirm DELIVERED orders after 3 days and transfer to shop
     */
    @Scheduled(cron = "0 0 0 * * *") // Run daily at midnight
    @Transactional
    public void autoConfirmDeliveredOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(AUTO_CONFIRM_DAYS);
        List<Order> deliveredOrders = orderRepo.findByStatusAndUpdatedAtBefore(
                OrderStatus.DELIVERED, threshold);

        for (Order order : deliveredOrders) {
            log.info("Auto-confirming order {} (delivered on {})",
                    order.getId(), order.getUpdatedAt());

            order.setStatus(OrderStatus.CONFIRMED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepo.save(order);

            transferToShopOnConfirmed(order);

            notificationService.sendNotification(
                    order.getCustomer(),
                    NotificationType.ORDER_UPDATE,
                    "Đơn hàng tự động xác nhận",
                    "Đơn hàng #" + order.getId() + " đã được tự động xác nhận sau " + AUTO_CONFIRM_DAYS + " ngày",
                    order.getId(),
                    Notification.Priority.MEDIUM,
                    Notification.Category.ORDER,
                    "✅"
            );
        }
    }

    /**
     * Process order status changes and trigger appropriate transfers
     */
    @Transactional
    public void processOrderStatusChange(Order order, OrderStatus newStatus) {
        if (order.getStatus() == newStatus) {
            log.info("Order {} already in status {}, skipping", order.getId(), newStatus);
            return;
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(order);

        switch (newStatus) {
            case CONFIRMED:
                    transferToShopOnConfirmed(order);
                break;
            case CANCELLED:
                if (List.of(PaymentMethod.WALLET, PaymentMethod.ONLINE).contains(order.getPaymentMethod())) {
                    refundToCustomer(order);
                }
                break;
            case PROCESSING:
                if (List.of(PaymentMethod.WALLET, PaymentMethod.ONLINE).contains(order.getPaymentMethod())) {
                    transferToAdminOnPayment(order);
                }
                break;
            default:
                log.info("No transfer action for status {} on order {}", newStatus, order.getId());
        }
    }
}