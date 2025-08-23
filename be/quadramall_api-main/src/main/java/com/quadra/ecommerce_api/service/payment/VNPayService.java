// com.quadra.ecommerce_api.service.payment.VNPayService.java
package com.quadra.ecommerce_api.service.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.config.payment.VNPayConfig;
import com.quadra.ecommerce_api.dto.custom.payment.request.DepositRequest;
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
import com.quadra.ecommerce_api.enums.wallet.WalletTransactionType;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.exception.payment.VnPayException;
import com.quadra.ecommerce_api.mapper.base.payment.PaymentTransactionMapper;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.payment.PaymentTransactionRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletRepo;
import com.quadra.ecommerce_api.repository.wallet.WalletTransactionRepo;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import com.quadra.ecommerce_api.utils.payment.VNPayUtil;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
@Slf4j
@Service
public class VNPayService {

    private final VNPayConfig vnpayConfig;
    private final PaymentService paymentService;
    private final WalletRepo walletRepo;
    private final PaymentTransactionRepo paymentTransactionRepo;
    private final PaymentTransactionMapper paymentTransactionMapper;
    private final WalletTransactionRepo walletTransactionRepo;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final OrderRepo orderRepo;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("BASE_URL")
    private String BASE_URL;

    @Autowired
    public VNPayService(
            VNPayConfig vnpayConfig,
            PaymentService paymentService,
            PaymentTransactionRepo paymentTransactionRepo,
            WalletRepo walletRepo,
            WalletTransactionRepo walletTransactionRepo,
            PaymentTransactionMapper paymentTransactionMapper,
            ObjectMapper objectMapper,
            NotificationService notificationService,
            OrderRepo orderRepo, RedisTemplate<String, String> redisTemplate) {
        this.vnpayConfig = vnpayConfig;
        this.paymentService = paymentService;
        this.paymentTransactionRepo = paymentTransactionRepo;
        this.walletTransactionRepo = walletTransactionRepo;
        this.paymentTransactionMapper = paymentTransactionMapper;
        this.walletRepo = walletRepo;
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
        this.orderRepo = orderRepo;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public String orderPayment(List<Order> orders, User user) {
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // ✅ Tạo base transaction code
        String baseTxnRef = generateUniqueTransactionCode();

        log.info("Generated base transaction code: {} for orders: {}", baseTxnRef, orderIds);

        for (Order order : orders) {
            totalAmount = totalAmount.add(order.getTotalAmount());

            // ✅ Tạo unique transaction code cho mỗi order
            String uniqueTxnRef = baseTxnRef + "-" + order.getId();

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setAmount(order.getTotalAmount());
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setCurrencyCode("VND");
            transaction.setGatewayName("VNPAY");
            transaction.setGatewayResponse(null);
            transaction.setMethod(PaymentMethod.ONLINE);
            transaction.setType(TransactionType.PAYMENT);
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setOrder(order);
            transaction.setTransactionCode(uniqueTxnRef); // ✅ Unique per order
            paymentTransactionRepo.save(transaction);

            log.info("Created transaction for order {}: {}", order.getId(), uniqueTxnRef);
        }

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(totalAmount.multiply(BigDecimal.valueOf(100)).longValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", baseTxnRef); // ✅ Sử dụng base code cho VNPay
        params.put("vnp_OrderInfo", "Thanh toan don hang " + baseTxnRef);
        params.put("vnp_OrderType", "order");
        params.put("vnp_Locale", "vn");

        String orderIdsStr = orderIds.stream().map(String::valueOf).collect(Collectors.joining("-"));
        params.put("vnp_ReturnUrl", BASE_URL+"/payment/return-order?orderIds=" + orderIdsStr);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        Calendar cld = Calendar.getInstance();
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime()));

        String hashData = VNPayUtil.buildQueryString(params);
        String secureHash = VNPayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashData);
        params.put("vnp_SecureHash", secureHash);

        return vnpayConfig.getUrl() + "?" + VNPayUtil.buildQueryString(params);
    }

    /**
     * Tạo unique transaction code với retry logic
     */
    private String generateUniqueTransactionCode() {
        int maxRetries = 5;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            // Tạo transaction code với timestamp và random string
            String txnRef = "VNPAY-" + System.currentTimeMillis() + "-" +
                    UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            // Kiểm tra xem đã tồn tại chưa
            if (!paymentTransactionRepo.existsByTransactionCode(txnRef)) {
                return txnRef;
            }

            retryCount++;
            log.warn("Transaction code {} already exists, retry {}/{}", txnRef, retryCount, maxRetries);

            // Sleep ngắn để tránh collision
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        // Fallback: nếu vẫn không tạo được unique code
        throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR,
                "Không thể tạo mã giao dịch unique sau " + maxRetries + " lần thử");
    }

    @Transactional
    public String deposit(User user, DepositRequest request) {
        if (request == null) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đã có lỗi xảy ra");
        }
        Wallet wallet = walletRepo.findByUserId(user.getId());
        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUser(user);
            walletRepo.save(wallet);
        }
        WalletTransaction walletTransaction = new WalletTransaction();
        walletTransaction.setWallet(wallet);
        walletTransaction.setDescription(request.getOrderRequest() != null ?
                "Nạp tiền để thanh toán đơn hàng" : "Nạp tiền từ VNPay");
        walletTransaction.setType(WalletTransactionType.TOP_UP);
        walletTransaction.setAmount(request.getAmount());
        walletTransaction.setStatus(TransactionStatus.PENDING);
        walletTransaction.setPaymentMethod(request.getPaymentMethod());
        walletTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepo.save(walletTransaction);

        // Lưu orderRequest và userId vào Redis nếu có
        if (request.getOrderRequest() != null) {
            try {
                String orderRequestJson = objectMapper.writeValueAsString(request.getOrderRequest());
                Map<String, String> depositData = new HashMap<>();
                depositData.put("orderRequest", orderRequestJson);
                depositData.put("userId", user.getId().toString());
                redisTemplate.opsForHash().putAll(
                        "deposit:orderRequest:" + walletTransaction.getId(),
                        depositData
                );
                redisTemplate.expire(
                        "deposit:orderRequest:" + walletTransaction.getId(), 15, TimeUnit.MINUTES
                );
            } catch (Exception e) {
                throw new ExCustom(HttpStatus.BAD_REQUEST, "Lỗi khi lưu orderRequest vào Redis");
            }
        }

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(request.getAmount().multiply(BigDecimal.valueOf(100)).longValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", walletTransaction.getId().toString());
        params.put("vnp_OrderInfo", request.getOrderRequest() != null ?
                "Nạp tiền để thanh toán đơn hàng " + walletTransaction.getId() :
                "Nạp tiền vào ví " + walletTransaction.getId());
        params.put("vnp_OrderType", "wallet");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", BASE_URL+"/payment/return-wallet");
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        Calendar cld = Calendar.getInstance();
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime()));

        String hashData = VNPayUtil.buildQueryString(params);
        String secureHash = VNPayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashData);
        params.put("vnp_SecureHash", secureHash);

        return vnpayConfig.getUrl() + "?" + VNPayUtil.buildQueryString(params);
    }

    public void validateReturnParams(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) {
            throw new VnPayException("97", "Missing secure hash");
        }

        Map<String, String> filteredParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("vnp_") && !key.equals("vnp_SecureHash")) {
                filteredParams.put(key, entry.getValue());
            }
        }

        String hashData = VNPayUtil.buildQueryString(filteredParams);
        String calculatedHash = VNPayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashData);

        if (!secureHash.equalsIgnoreCase(calculatedHash)) {
            throw new VnPayException("97", "Invalid signature");
        }
    }

    @Transactional
    public void handleVNPaySuccess(List<Order> orders, User user, Map<String, String> params) {
        for (Order order : orders) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepo.save(order);

            PaymentTransaction transaction = paymentTransactionRepo.findByOrderId(order.getId())
                    .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch"));
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setGatewayResponse(params.get("vnp_ResponseCode"));
            paymentTransactionRepo.save(transaction);

            notificationService.sendNotification(
                    user,
                    NotificationType.ORDER_UPDATE,
                    "Đặt hàng thành công",
                    "Đơn hàng #" + order.getId() + " đã thanh toán VNPay thành công. Mã giao dịch: " + params.get("vnp_TxnRef"),
                    order.getId(),
                    Notification.Priority.HIGH,
                    Notification.Category.PAYMENT,
                    "💳"
            );
        }
    }
}