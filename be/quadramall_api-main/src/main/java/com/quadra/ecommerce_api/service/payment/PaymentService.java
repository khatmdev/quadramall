// com.quadra.ecommerce_api.service.payment.PaymentService.java
package com.quadra.ecommerce_api.service.payment;

import com.quadra.ecommerce_api.dto.base.payment.PaymentTransactionDTO;
import com.quadra.ecommerce_api.dto.custom.payment.response.OrderResult;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.order.OrderDiscount;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.entity.wallet.WalletTransaction;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.payment.TransactionType;
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionType;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.mapper.base.payment.PaymentTransactionMapper;
import com.quadra.ecommerce_api.repository.order.OrderDiscountRepository;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.payment.PaymentTransactionRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletTransactionRepo;
import com.quadra.ecommerce_api.service.customer.cart.CartService;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepo orderRepo;
    private final PaymentTransactionRepo paymentTransactionRepo;
    private final PaymentTransactionMapper paymentTransactionMapper;
    private final WalletRepo walletRepo;
    private final WalletTransactionRepo walletTransactionRepo;
    private final CartService cartService;
    private final OrderItemRepo orderItemRepo;
    private final ProductService productService;
    private final NotificationService notificationService;
    private final OrderService orderService;
    private final OrderDiscountRepository orderDiscountRepository;
    private final BalanceTransferService balanceTransferService;

    public Optional<Order> getOrderRepo(Long id) {
        return orderRepo.findById(id);
    }

    @Transactional
    public OrderResult handleOrderPaymentCOD(List<Order> orders, User user) {
        log.info("Processing COD payment for {} orders", orders.size());

        for (Order order : orders) {
            log.info("Processing order {}", order.getId());

            // Kiểm tra tồn kho
            List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
            for (OrderItem item : orderItems) {
                ProductVariant variant = item.getVariant();
                int requiredQuantity = item.getQuantity();
                log.info("Checking stock for variant {} (product: {}): required={}, available={}",
                        variant.getSku(),
                        variant.getProduct().getName(),
                        requiredQuantity,
                        variant.getStockQuantity());

                if (variant.getStockQuantity() < requiredQuantity) {
                    throw new ExCustom(HttpStatus.BAD_REQUEST,
                            "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
                }
            }

            // Trừ tồn kho
            for (OrderItem item : orderItems) {
                ProductVariant variant = item.getVariant();
                int oldStock = variant.getStockQuantity();
                variant.setStockQuantity(oldStock - item.getQuantity());
                productService.updateProductVariant(variant);
                log.info("Updated stock for variant {}: {} -> {}",
                        variant.getSku(), oldStock, variant.getStockQuantity());
            }

            // Tạo payment transaction
            PaymentTransaction paymentTransaction = new PaymentTransaction();
            paymentTransaction.setOrder(order);
            paymentTransaction.setMethod(PaymentMethod.COD);
            paymentTransaction.setStatus(TransactionStatus.PENDING);
            paymentTransaction.setGatewayName("COD");
            paymentTransaction.setCurrencyCode("VND");
            paymentTransaction.setCreatedAt(LocalDateTime.now());
            paymentTransaction.setAmount(order.getTotalAmount());
            paymentTransaction.setType(TransactionType.PAYMENT);

            order.setStatus(OrderStatus.PROCESSING);
            order.setPaymentMethod(PaymentMethod.COD);
            orderRepo.save(order);

            // Xác nhận sử dụng voucher
            orderService.confirmVoucherUsage(order);

            paymentTransactionRepo.save(paymentTransaction);

            // Log chi tiết order
            logOrderDetails(order);

            // ✅ TẠO DELIVERY ASSIGNMENT SAU KHI THANH TOÁN THÀNH CÔNG
            orderService.createDeliveryAssignment(order);

            notificationService.sendNotification(
                    user,
                    NotificationType.ORDER_UPDATE,
                    "Đặt hàng thành công",
                    "Đơn hàng #" + order.getId() + " đã được xử lý. Phương thức: COD. Tổng: " + order.getTotalAmount(),
                    order.getId(),
                    Notification.Priority.MEDIUM,
                    Notification.Category.ORDER,
                    "📦"
            );
        }

        // Xóa cart items
        cartService.deleteCartItemsByOrderIds(orders.stream().map(Order::getId).toList(), user.getId());

        String joinedOrderIds = orders.stream()
                .map(order -> String.valueOf(order.getId()))
                .collect(Collectors.joining("-"));

        return new OrderResult(joinedOrderIds, "COD", "Đặt hàng thành công");
    }

    // Helper method để log chi tiết order
    private void logOrderDetails(Order order) {
        log.info("=== ORDER DETAILS ===");
        log.info("Order ID: {}", order.getId());
        log.info("Store: {} (ID: {})", order.getStore().getName(), order.getStore().getId());
        log.info("Total Amount: {}", order.getTotalAmount());

        // Log order items
        List<OrderItem> items = orderItemRepo.findByOrderId(order.getId());
        log.info("Order has {} items:", items.size());
        for (OrderItem item : items) {
            log.info("  - Product: {} (ID: {})",
                    item.getVariant().getProduct().getName(),
                    item.getVariant().getProduct().getId());
            log.info("    Variant: {} | Price: {} | Quantity: {} | Subtotal: {}",
                    item.getVariant().getSku(),
                    item.getPriceAtTime(),
                    item.getQuantity(),
                    item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Log discount if applied
        OrderDiscount orderDiscount = orderDiscountRepository.findByOrderId(order.getId());
        if (orderDiscount != null) {
            log.info("Applied Discount:");
            log.info("  - Code: {}", orderDiscount.getDiscountCode().getCode());
            log.info("  - Type: {} | Applies to: {}",
                    orderDiscount.getDiscountCode().getDiscountType(),
                    orderDiscount.getDiscountCode().getAppliesTo());
            log.info("  - Discount Amount: {}", orderDiscount.getDiscountAmount());
            log.info("  - Original: {} | Final: {}",
                    orderDiscount.getOriginalAmount(),
                    orderDiscount.getFinalAmount());
        }

        log.info("=== END ORDER DETAILS ===");
    }


    @Transactional
    public OrderResult handleOrderPaymentWallet(List<Order> orders, User user) {
        Wallet wallet = walletRepo.findByUserId(user.getId());
        WalletTransaction walletTransaction = new WalletTransaction();
        BigDecimal totalAmount = orders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        PaymentTransaction paymentTransaction = new PaymentTransaction();
        String joinedOrderIds = orders.stream()
                .map(order -> String.valueOf(order.getId()))
                .collect(Collectors.joining("-"));

        log.info("Tổng tiền đơn hàng: {}", totalAmount);
        log.info("Tổng tiền Có trong ví : {}", wallet.getBalance());

        if (wallet.getBalance().compareTo(totalAmount) >= 0) {
            for (Order order : orders) {
                List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
                for (OrderItem item : orderItems) {
                    ProductVariant variant = item.getVariant();
                    int requiredQuantity = item.getQuantity();
                    if (variant.getStockQuantity() < requiredQuantity) {
                        throw new ExCustom(HttpStatus.BAD_REQUEST, "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
                    }
                }

                for (OrderItem item : orderItems) {
                    ProductVariant variant = item.getVariant();
                    variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
                    productService.updateProductVariant(variant);
                }

                order.setPaymentMethod(PaymentMethod.WALLET);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepo.save(order);

                balanceTransferService.processOrderStatusChange(order, OrderStatus.PROCESSING);


                walletTransaction.setAmount(order.getTotalAmount());
                walletTransaction.setCreatedAt(LocalDateTime.now());
                walletTransaction.setWallet(wallet);
                walletTransaction.setDescription("Thanh toán đơn hàng #" + order.getId());
                walletTransaction.setStatus(TransactionStatus.COMPLETED);
                walletTransaction.setType(WalletTransactionType.PAYMENT);
                walletTransaction.setReferenceId(order.getId());
                walletTransaction.setPaymentMethod("WALLET");
                walletTransactionRepo.save(walletTransaction);

                paymentTransaction.setOrder(order);
                paymentTransaction.setMethod(PaymentMethod.WALLET);
                paymentTransaction.setType(TransactionType.PAYMENT);
                paymentTransaction.setStatus(TransactionStatus.COMPLETED);
                paymentTransaction.setGatewayName("WALLET");
                paymentTransaction.setCurrencyCode("VND");
                paymentTransaction.setCreatedAt(LocalDateTime.now());
                paymentTransaction.setAmount(order.getTotalAmount());
                paymentTransactionRepo.save(paymentTransaction);

                wallet.setBalance(wallet.getBalance().subtract(order.getTotalAmount()));

                orderService.confirmVoucherUsage(order);
                // ✅ TẠO DELIVERY ASSIGNMENT SAU KHI THANH TOÁN THÀNH CÔNG
                orderService.createDeliveryAssignment(order);
                walletRepo.save(wallet);


            }
            notificationService.sendNotification(
                    user,
                    NotificationType.PAYMENT_SUCCESS,
                    "Thông báo biến động số dư",
                    "Thanh toán đơn hàng #" + joinedOrderIds+".Thiệt hại: - "+totalAmount + " Số dư : "+wallet.getBalance()+"VND",
                    walletTransaction.getId(),
                    Notification.Priority.HIGH,
                    Notification.Category.PAYMENT,
                    "💸"
            );
            notificationService.sendNotification(
                    user,
                    NotificationType.ORDER_UPDATE,
                    "Đặt hàng thành công",
                    "Đơn hàng #" + joinedOrderIds + " đã được thanh toán qua ví. Tổng: " +totalAmount,
                    paymentTransaction.getId(),
                    Notification.Priority.HIGH,
                    Notification.Category.ORDER,
                    "💸"
            );
        } else {
            for (Order order : orders) {
                balanceTransferService.processOrderStatusChange(order, OrderStatus.CANCELLED);
                order.setPaymentMethod(PaymentMethod.WALLET);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepo.save(order);

                paymentTransaction.setOrder(order);
                paymentTransaction.setMethod(PaymentMethod.WALLET);
                paymentTransaction.setType(TransactionType.PAYMENT);
                paymentTransaction.setStatus(TransactionStatus.FAILED);
                paymentTransaction.setGatewayName("WALLET");
                paymentTransaction.setCurrencyCode("VND");
                paymentTransaction.setCreatedAt(LocalDateTime.now());
                paymentTransaction.setAmount(order.getTotalAmount());
                paymentTransactionRepo.save(paymentTransaction);

                notificationService.sendNotification(
                        user,
                        NotificationType.ORDER_UPDATE,
                        "Đặt hàng thất bại",
                        "Đơn hàng #" + order.getId() + " bị hủy do ví không đủ tiền.",
                        order.getId(),
                        Notification.Priority.HIGH,
                        Notification.Category.ORDER,
                        "❌"
                );
            }
        }

        if (paymentTransaction.getStatus().equals(TransactionStatus.COMPLETED)) {
            cartService.deleteCartItemsByOrderIds(orders.stream().map(Order::getId).toList(), user.getId());
        }



        return new OrderResult(joinedOrderIds, paymentTransaction.getStatus().toString(), "");
    }
}