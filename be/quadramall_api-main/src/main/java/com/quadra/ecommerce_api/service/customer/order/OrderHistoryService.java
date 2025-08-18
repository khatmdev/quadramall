package com.quadra.ecommerce_api.service.customer.order;

import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.dto.custom.order.request.OrderRequest;
import com.quadra.ecommerce_api.dto.custom.payment.response.OrderResult;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.entity.discount.UserDiscount;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingStatus;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.address.AddressRepo;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import com.quadra.ecommerce_api.repository.discount.UserDiscountRepository;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.payment.PaymentTransactionRepo;
import com.quadra.ecommerce_api.repository.product.AddonRepo;
import com.quadra.ecommerce_api.repository.shipping.OrderShippingRepo;
import com.quadra.ecommerce_api.service.customer.cart.CartService;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {
    public List<Order> getOrdersByStatusAndUserId(OrderStatus status, Long userId) {
        return orderRepository.findByStatusAndCustomer_Id(status, userId);
    }

    private final OrderRepo orderRepository;
    private final OrderShippingRepo orderShippingRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountRepository userDiscountRepository;
    private final AddressRepo addressRepo;
    private final PaymentTransactionRepo paymentTransactionRepository;
    private final CartService cartService;
    private final OrderItemRepo orderItemRepo;
    private final ProductService productService;
    private final AddonRepo addonRepo;

    private static final BigDecimal SHIPPING_COST = BigDecimal.valueOf(30000);
    private final NotificationService notificationService;

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public void update(Order order) {
        orderRepository.save(order);
    }

    public DiscountCode getDiscountCodeByCode(String code) {
        return discountCodeRepository.findByCode(code).orElse(null);
    }

    public void recordDiscountUsage(Long userId, Long discountId) {
        UserDiscount userDiscount = UserDiscount.builder()
                .userId(userId)
                .discountId(discountId)
                .usedAt(LocalDateTime.now())
                .build();
        userDiscountRepository.save(userDiscount);
    }

    public List<Order> getOrdersByIdAndUserId(List<Long> orderIds, Long id) {
        // Nếu orderIds là null hoặc rỗng, lấy tất cả đơn hàng của user
        if (orderIds == null || orderIds.isEmpty()) {
            return orderRepository.findByCustomer_Id(id);
        }
        return orderRepository.findByIdInAndCustomer_Id(orderIds, id);
    }


    @Transactional
    public List<Order> handlePaymentOrder(OrderRequest orderRequest, User user) {
        if (orderRequest.getOrderIds() == null || orderRequest.getOrderIds().isEmpty()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng không tồn tại. Vui lòng thử lại sau.");
        }
        if (orderRequest.getAddressId() == null) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Bạn chưa chọn địa chỉ giao hàng vui lòng chọn đi nhé.");
        }

        List<Order> orders = getOrdersByIdAndUserId(orderRequest.getOrderIds(), user.getId());
        if (orders.isEmpty()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng không tồn tại. Vui lòng thử lại sau.");
        }

        List<Order> ordersResponse = new ArrayList<>();
        for (Order order : orders) {
            order.setStatus(OrderStatus.PENDING);
            PaymentMethod paymentMethod = PaymentMethod.valueOf(orderRequest.getPaymentMethod());
            order.setPaymentMethod(paymentMethod);
            order.setShippingMethod(ShippingMethod.STANDARD);

            Map<Long, String> notes = orderRequest.getNotes();
            if (notes != null) {
                order.setNote(notes.get(order.getId()));
            }

            OrderShipping orderShipping = new OrderShipping();
            orderShipping.setOrder(order);
            orderShipping.setShippingStatus(ShippingStatus.PENDING);
            orderShipping.setShippingCost(SHIPPING_COST);
            orderShipping.setCreatedAt(LocalDateTime.now());

            AddressDTO pickupAddress = addressRepo.findDefaultByUser(order.getStore().getOwner());
            if (pickupAddress == null) {
                throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng của người bán.");
            }

            orderShipping.setPickupName(order.getStore().getName());
            orderShipping.setPickupPhone(pickupAddress.getReceiverPhone());
            orderShipping.setPickupProvince(pickupAddress.getCity());
            orderShipping.setPickupDistrict(pickupAddress.getDistrict());
            orderShipping.setPickupWard(pickupAddress.getWard());
            orderShipping.setPickupAddress(pickupAddress.getDetailAddress());

            Address address = addressRepo.findByIdAndUser(orderRequest.getAddressId(), user);
            if (address == null) {
                throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng của bạn.");
            }

            orderShipping.setDeliveryName(address.getReceiverName());
            orderShipping.setDeliveryPhone(address.getReceiverPhone());
            orderShipping.setDeliveryProvince(address.getCity());
            orderShipping.setDeliveryDistrict(address.getDistrict());
            orderShipping.setDeliveryWard(address.getWard());
            orderShipping.setDeliveryAddress(address.getDetailAddress());
            orderShipping.setUpdatedAt(LocalDateTime.now());
            orderShippingRepository.save(orderShipping);

            order.setTotalAmount(order.getTotalAmount().add(orderShipping.getShippingCost()));
            orderRepository.save(order);
            ordersResponse.add(order);
        }
        return ordersResponse;
    }

    @Transactional
    public OrderResult handleOrderPaymentVNPay(Map<String, String> params, List<Long> orderIds) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String transactionCodeFromVNPay = params.get("vnp_TransactionNo");
        String responseCode = params.get("vnp_ResponseCode");

        List<Order> orders = orderRepository.findByIdIn(orderIds);
        String status = "";
        String message = "";
        Long userId = orders.getFirst().getCustomer().getId();

        for (Order order : orders) {
            PaymentTransaction transaction = paymentTransactionRepository
                    .findByOrderIdAndTransactionCode(order.getId(), vnpTxnRef)
                    .orElseThrow(() -> new ExCustom(HttpStatus.BAD_REQUEST, "Không tìm thấy giao dịch"));

            String finalTransactionCode;
            if (transactionCodeFromVNPay != null && !"0".equals(transactionCodeFromVNPay)) {
                finalTransactionCode = "VNPAY-" + transactionCodeFromVNPay;
            } else {
                finalTransactionCode = "VNPAY-FAIL-" + order.getId() + "-" + System.currentTimeMillis();
            }

            transaction.setTransactionCode(finalTransactionCode);
            transaction.setPaidAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            if ("00".equals(responseCode)) {
                // Kiểm tra tồn kho trước khi trừ
                List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
                for (OrderItem item : orderItems) {
                    ProductVariant variant = item.getVariant();
                    int requiredQuantity = item.getQuantity();
                    if (variant.getStockQuantity() < requiredQuantity) {
                        throw new ExCustom(HttpStatus.BAD_REQUEST,
                                "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
                    }
                }

                // Trừ tồn kho khi thanh toán thành công
                for (OrderItem item : orderItems) {
                    ProductVariant variant = item.getVariant();
                    variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
                    productService.updateProductVariant(variant);
                }

                order.setStatus(OrderStatus.PROCESSING);
                transaction.setStatus(TransactionStatus.COMPLETED);
                message = "Thanh toán thành công";

                notificationService.sendNotification(
                        order.getCustomer(),
                        NotificationType.ORDER_UPDATE,
                        "Đặt hàng thành công",
                        "Đơn hàng #" + order.getId() + " đã được thanh toán qua VNPay. Tổng: " + order.getTotalAmount(),
                        order.getId(),
                        Notification.Priority.HIGH,
                        Notification.Category.ORDER,
                        "💸"
                );
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                transaction.setStatus(TransactionStatus.FAILED);
                message = "Thanh toán thất bại";
                // Không cộng lại tồn kho tại đây vì tồn kho chưa bị trừ trước đó
            }

            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            paymentTransactionRepository.save(transaction);
            status = transaction.getStatus().toString();
        }

        if ("00".equals(responseCode)) {
            cartService.deleteCartItemsByOrderIds(orderIds, userId);
        }

        return new OrderResult(vnpTxnRef, status, message);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng đã bị hủy");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Cộng lại tồn kho nếu đơn hàng đã được xử lý (tồn kho đã bị trừ)
        if (order.getStatus() == OrderStatus.PROCESSING) {
            List<OrderItem> orderItems = orderItemRepo.findByOrderId(orderId);
            for (OrderItem item : orderItems) {
                ProductVariant variant = item.getVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                productService.updateProductVariant(variant);
            }
        }
    }

}