package com.quadra.ecommerce_api.controller.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.controller.order.OrderController;
import com.quadra.ecommerce_api.dto.custom.order.request.OrderRequest;
import com.quadra.ecommerce_api.dto.custom.payment.request.DepositRequest;
import com.quadra.ecommerce_api.dto.custom.payment.response.DepositResponse;
import com.quadra.ecommerce_api.dto.custom.payment.response.OrderResult;
import com.quadra.ecommerce_api.dto.custom.payment.response.PaymentResponse;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.exception.payment.VnPayException;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.service.payment.OrderService;
import com.quadra.ecommerce_api.service.payment.PaymentService;
import com.quadra.ecommerce_api.service.payment.VNPayService;
import com.quadra.ecommerce_api.service.wallet.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final VNPayService vnPayService;
    private final PaymentService paymentService;
    private final WalletService walletService;
    private final OrderService orderService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final UserRepo userRepository;

    @Value("PUBLIC_DOMAIN")
    private String PUBLIC_DOMAIN;

    @Autowired
    public PaymentController(
            VNPayService vnPayService,
            PaymentService paymentService,
            WalletService walletService,
            OrderController orderController,
            OrderService orderService,
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper,
            UserRepo userRepository
    ) {
        this.vnPayService = vnPayService;
        this.paymentService = paymentService;
        this.walletService = walletService;
        this.orderService = orderService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
    }

    @PostMapping("/create-orders")
    public ResponseEntity<?> processPayment(@AuthenticationPrincipal User user,
                                            @RequestBody OrderRequest orderRequest) {
        System.out.println("ORDER: " + orderRequest);
        assert orderRequest != null;
        Optional<Order> orderOptional = paymentService.getOrderRepo(orderRequest.getOrderIds().getFirst());
        List<Order> orders = orderService.handlePaymentOrder(orderRequest, user);

        String paymentMethod = String.valueOf(orderRequest.getPaymentMethod());
        System.out.println("paymentMethod: " + paymentMethod);
        return switch (paymentMethod) {
            case "ONLINE" -> {
                String paymentUrl = vnPayService.orderPayment(orders, user);
                yield ResponseEntity.ok(Map.of(
                        "status", "success",
                        "redirectUrl", paymentUrl,
                        "type", "redirect"
                ));
            }
            case "WALLET" -> {
                OrderResult orderResult = paymentService.handleOrderPaymentWallet(orders, user);
                String redirectUrl = PUBLIC_DOMAIN+"/order?orderIds="
                        + orderResult.getTxnRef()
                        + "&status=" + orderResult.getStatus();
                yield ResponseEntity.ok(Map.of(
                        "status", "success",
                        "redirectUrl", redirectUrl,
                        "type", "redirect"
                ));
            }
            default -> {
                OrderResult orderResult = paymentService.handleOrderPaymentCOD(orders, user);
                String redirectUrl = PUBLIC_DOMAIN+"/order?orderIds="
                        + orderResult.getTxnRef()
                        + "&status=" + orderResult.getStatus();
                yield ResponseEntity.ok(Map.of(
                        "status", "success",
                        "redirectUrl", redirectUrl,
                        "type", "redirect"
                ));
            }
        };
    }

    @PostMapping("/create-deposit")
    public ResponseEntity<?> processDeposit(@AuthenticationPrincipal User user,
                                            @RequestBody DepositRequest request) {
        System.out.println("DEPOSIT: " + request);
        BigDecimal amount = request.getAmount();
        if (amount.compareTo(BigDecimal.valueOf(50000)) >= 0 && amount.compareTo(BigDecimal.valueOf(100000000)) <= 0) {
            String paymentUrl = vnPayService.deposit(user, request);
            return ResponseEntity.ok(new PaymentResponse(paymentUrl, null));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Số tiền nạp phải từ 50.000 VNĐ đến 100.000.000 VNĐ"));
    }

    @GetMapping("/return-wallet")
    public ResponseEntity<?> handleReturnWallet(@RequestParam Map<String, String> params) {
        params.forEach((key, value) -> System.out.println(key + ": " + value));
        vnPayService.validateReturnParams(params);
        DepositResponse depositResponse = walletService.handleDeposit(params);
        String txnRef = params.get("vnp_TxnRef");

        // Kiểm tra xem deposit có liên quan đến order không
        Map<Object, Object> depositData = redisTemplate.opsForHash().entries("deposit:orderRequest:" + txnRef);
        System.out.println(depositData);
        if (!depositData.isEmpty()) {
            try {
                String orderRequestJson = (String) depositData.get("orderRequest");
                String userId = (String) depositData.get("userId");
                if (orderRequestJson != null && userId != null) {
                    OrderRequest orderRequest = objectMapper.readValue(orderRequestJson, OrderRequest.class);
                    User user = userRepository.findById(Long.parseLong(userId))
                            .orElseThrow(() -> new ExCustom(HttpStatus.BAD_REQUEST, "Không tìm thấy người dùng"));
                    // Xử lý thanh toán đơn hàng
                    List<Order> orders = orderService.handlePaymentOrder(orderRequest, user);
                    OrderResult orderResult = paymentService.handleOrderPaymentWallet(orders, user);
                    String redirectUrl = PUBLIC_DOMAIN+"/order?orderIds="
                            + orderResult.getTxnRef()
                            + "&status=" + orderResult.getStatus();
                    // Xóa dữ liệu khỏi Redis
                    redisTemplate.delete("deposit:orderRequest:" + txnRef);
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header("Location", redirectUrl)
                            .body(Map.of(
                                    "status", "success",
                                    "redirectUrl", redirectUrl,
                                    "orderResult", orderResult
                            ));
                }
            } catch (Exception e) {
                System.out.println("Lỗi khi xử lý orderRequest từ Redis: " + e.getMessage());
                throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi xử lý thanh toán đơn hàng: " + e.getMessage());
            }
        }

        // Nếu không có orderRequest, chuyển hướng đến trang ví
        String redirectUrl = PUBLIC_DOMAIN+"/wallet?transactionId="
                + depositResponse.getWalletTransactionDTO().getId()
                + "&status=" + depositResponse.getWalletTransactionDTO().getStatus()
                + "&amount=" + depositResponse.getWalletTransactionDTO().getAmount();
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", redirectUrl)
                .body(Map.of(
                        "status", "success",
                        "redirectUrl", redirectUrl,
                        "type", "wallet"
                ));
    }

    @GetMapping("/return-order")
    public ResponseEntity<?> handleReturnOrder(@RequestParam Map<String, String> params,
                                               @RequestParam("orderIds") String orderIdsStr) {
        vnPayService.validateReturnParams(params);
        List<Long> orderIds = Arrays.stream(orderIdsStr.split("-"))
                .map(Long::parseLong)
                .toList();
        OrderResult orderResult = orderService.handleOrderPaymentVNPay(params, orderIds);
        String redirectUrl = PUBLIC_DOMAIN+"/order?orderIds=" + orderIdsStr
                + "&status=" + orderResult.getStatus();
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", redirectUrl)
                .build();
    }

    @PostMapping(value = "/ipn", produces = MediaType.APPLICATION_JSON_VALUE)
    public String handleIpn(@RequestParam Map<String, String> params) {
        try {
            vnPayService.validateReturnParams(params);
            return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
        } catch (VnPayException e) {
            return String.format("{\"RspCode\":\"%s\",\"Message\":\"%s\"}", e.getRspCode(), e.getMessage());
        } catch (Exception e) {
            return "{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}";
        }
    }
}