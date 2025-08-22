package com.quadra.ecommerce_api.service.payment;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.order.request.OrderRequest;
import com.quadra.ecommerce_api.dto.custom.order.response.*;
import com.quadra.ecommerce_api.dto.custom.payment.response.OrderResult;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.discount.UserDiscount;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.order.OrderDiscount;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.order.OrderItemAddon;
import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.entity.product.Addon;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.shipping.DeliveryAssignment;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
import com.quadra.ecommerce_api.enums.discount.DiscountType;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.payment.TransactionStatus;
import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingStatus;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.mapper.base.store.CategoryMapper;
import com.quadra.ecommerce_api.mapper.base.store.ItemTypeMapper;
import com.quadra.ecommerce_api.repository.address.AddressRepo;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import com.quadra.ecommerce_api.repository.discount.UserDiscountRepository;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import com.quadra.ecommerce_api.repository.order.OrderDiscountRepository;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.payment.PaymentTransactionRepo;
import com.quadra.ecommerce_api.repository.product.AddonRepo;
import com.quadra.ecommerce_api.repository.shipping.DeliveryAssignmentRepository;
import com.quadra.ecommerce_api.repository.shipping.OrderShippingRepo;
import com.quadra.ecommerce_api.service.customer.cart.CartService;
import com.quadra.ecommerce_api.service.customer.order.OrderItemAddonService;
import com.quadra.ecommerce_api.service.customer.order.OrderItemService;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.service.discount.DiscountCodeService;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("paymentOrderService")
@RequiredArgsConstructor
@Slf4j
public class OrderService {

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
    private final NotificationService notificationService;
    private final DiscountCodeService discountCodeService;
    private final OrderDiscountRepository orderDiscountRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final FlashSaleRepo flashSaleRepo;

    private static final BigDecimal SHIPPING_COST = BigDecimal.valueOf(30000);
    private final BalanceTransferService balanceTransferService;
    private final OrderItemAddonService orderItemAddonService;
    private final OrderItemService orderItemService;
    private final CategoryMapper categoryMapper;
    private final ItemTypeMapper itemTypeMapper;
    private final FlashSaleHelper flashSaleHelper;

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public void update(Order order) {
        orderRepository.save(order);
    }

    public void recordDiscountUsage(Long userId, Long discountId) {
        // ✅ Kiểm tra xem user đã sử dụng discount này chưa
        boolean alreadyUsed = userDiscountRepository.existsByUserIdAndDiscountCode_Id(userId, discountId);
        if (alreadyUsed) {
            log.warn("User {} already used discount {}, skipping record", userId, discountId);
            return;
        }

        // ✅ Lấy DiscountCode entity từ database
        DiscountCode discountCode = discountCodeRepository.findById(discountId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy mã giảm giá"));

        // ✅ Tạo UserDiscount với composite key mapping
        UserDiscount userDiscount = new UserDiscount();
        userDiscount.setUserId(userId);
        userDiscount.setDiscountId(discountId); // Set ID cho composite key
        userDiscount.setDiscountCode(discountCode); // Set entity cho relationship
        userDiscount.setUsedAt(LocalDateTime.now());

        userDiscountRepository.save(userDiscount);

        log.info("Recorded discount usage: user={}, discount={}", userId, discountCode.getCode());
    }

    public List<Order> getOrdersByIdAndUserId(List<Long> orderIds, Long id) {
        return orderRepository.findByIdInAndCustomer_Id(orderIds, id);
    }

    /**
     * ✅ FIX: Tính tổng tiền của các items trong order (không bao gồm shipping và discount)
     * SỬ DỤNG GIÁ ĐÃ LƯU TRONG ORDER ITEM (priceAtTime) - đã bao gồm Flash Sale
     */
    private BigDecimal calculateItemsTotal(Order order) {
        List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
        return orderItems.stream()
                .map(item -> {
                    // ✅ SỬ DỤNG GIÁ ĐÃ LƯU SẴN (đã bao gồm Flash Sale nếu có)
                    BigDecimal itemTotal = item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity()));

                    // Thêm giá addon nếu có
                    List<OrderItemAddon> addons = orderItemAddonService.getByOrderItem(item);
                    BigDecimal addonTotal = addons.stream()
                            .map(OrderItemAddon::getPriceAdjustAtTime)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return itemTotal.add(addonTotal);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * ✅ HELPER METHOD: Lấy thông tin Flash Sale cho OrderItem để hiển thị
     * CHỈ dùng để tạo response, KHÔNG dùng để tính giá
     */
    private OrderItemFlashSaleInfo getFlashSaleInfoForOrderItem(OrderItem orderItem) {
        ProductVariant variant = orderItem.getVariant();
        Product product = variant.getProduct();

        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(product.getId());

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra còn số lượng trong flash sale không
            if (flashSale.getSoldCount() + orderItem.getQuantity() <= flashSale.getQuantity()) {
                return OrderItemFlashSaleInfo.builder()
                        .id(flashSale.getId())
                        .percentageDiscount(Double.valueOf(flashSale.getPercentageDiscount()))
                        .quantity(flashSale.getQuantity())
                        .soldCount(flashSale.getSoldCount())
                        .endTime(flashSale.getEndTime().toString())
                        .build();
            }
        }

        return null; // Không có Flash Sale hoặc hết số lượng
    }

    @Transactional
    public List<Order> handlePaymentOrder(OrderRequest orderRequest, User user) {
        if (orderRequest.getOrderIds() == null || orderRequest.getOrderIds().isEmpty()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng không tồn tại. Vui lòng thử lại sau.");
        }
        if (orderRequest.getAddressId() == null) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Bạn chưa chọn địa chỉ giao hàng vui lòng chọn đi nhé.");
        }

        log.info("Processing payment for orders: {}", orderRequest.getOrderIds());
        log.info("Voucher IDs: {}", orderRequest.getVoucherIds());

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

            // Xử lý ghi chú
            Map<Long, String> notes = orderRequest.getNotes();
            if (notes != null) {
                order.setNote(notes.get(order.getId()));
            }

            // Xử lý OrderShipping
            OrderShipping orderShipping = createOrderShipping(order, user, orderRequest.getAddressId());
            orderShippingRepository.save(orderShipping);

            // ✅ FIX: SỬ DỤNG GIÁ ĐÃ LƯU SẴN (đã bao gồm Flash Sale)
            BigDecimal itemsTotal = calculateItemsTotal(order);

            // Tính tổng tiền bao gồm shipping cost
            BigDecimal totalWithShipping = itemsTotal.add(orderShipping.getShippingCost());

            log.info("Order {}: Items total = {}, Shipping cost = {}, Total with shipping = {}",
                    order.getId(), itemsTotal, orderShipping.getShippingCost(), totalWithShipping);

            // Set total amount trước khi apply voucher
            order.setTotalAmount(totalWithShipping);

            // Xử lý voucher nếu có
            BigDecimal finalTotalAmount = totalWithShipping;
            if (orderRequest.getVoucherIds() != null && orderRequest.getVoucherIds().containsKey(order.getId())) {
                Long voucherId = orderRequest.getVoucherIds().get(order.getId());

                if (voucherId != null) {
                    log.info("Applying voucher {} to order {}", voucherId, order.getId());

                    BigDecimal discountAmount = applyVoucherToOrder(order, voucherId, user);

                    // Cập nhật tổng tiền sau giảm giá
                    if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                        finalTotalAmount = totalWithShipping.subtract(discountAmount);
                        log.info("Applied discount {} to order {}, final total: {}",
                                discountAmount, order.getId(), finalTotalAmount);
                    }
                }
            }

            // Set final total amount
            order.setTotalAmount(finalTotalAmount);

            // ✅ REMOVE: Không cần cập nhật giá Flash Sale nữa vì đã tính khi tạo order
            // updateOrderItemsWithFlashSale(order);

            orderRepository.save(order);
            ordersResponse.add(order);
        }

        return ordersResponse;
    }

    private OrderShipping createOrderShipping(Order order, User user, Long addressId) {
        OrderShipping orderShipping = new OrderShipping();
        orderShipping.setOrder(order);
        orderShipping.setShippingStatus(ShippingStatus.PENDING);
        orderShipping.setCreatedAt(LocalDateTime.now());

        // Set pickup address (store address)
        String[] parts = order.getStore().getAddress().split("\\s*,\\ss*");
        if (parts == null || parts.length < 6) {
            throw new ResourceNotFound( "Không tìm thấy địa chỉ giao hàng của người bán. Hoặc không đúng định dạng ");
        }

        // Thiết lập địa chỉ lấy hàng (pickup)
        orderShipping.setPickupName(parts[0]);
        orderShipping.setPickupPhone(parts[1]);
        orderShipping.setPickupAddress(parts[2]);
        orderShipping.setPickupWard(parts[3]);
        orderShipping.setPickupDistrict(parts[4]);
        orderShipping.setPickupProvince(parts[5]);
        orderShipping.setUpdatedAt(LocalDateTime.now());

        // Set delivery address
        Address address = addressRepo.findByIdAndUser(addressId, user);
        if (address == null) {
            throw new ResourceNotFound("Không tìm thấy địa chỉ giao hàng của bạn.");
        }

        orderShipping.setDeliveryName(address.getReceiverName());
        orderShipping.setDeliveryPhone(address.getReceiverPhone());
        orderShipping.setDeliveryProvince(address.getCity());
        orderShipping.setDeliveryDistrict(address.getDistrict());
        orderShipping.setDeliveryWard(address.getWard());
        orderShipping.setDeliveryAddress(address.getDetailAddress());
        orderShipping.setUpdatedAt(LocalDateTime.now());

        // ✅ TÍNH SHIPPING COST DỰA TRÊN TỈNH THÀNH
        BigDecimal shippingCost = calculateShippingCost(
                orderShipping.getPickupProvince(),
                orderShipping.getDeliveryProvince()
        );
        orderShipping.setShippingCost(shippingCost);

        return orderShipping;
    }

    /**
     * Tính phí vận chuyển dựa trên tỉnh thành
     * Miễn phí nếu cùng tỉnh, có phí nếu khác tỉnh
     */
    private BigDecimal calculateShippingCost(String pickupProvince, String deliveryProvince) {
        if (pickupProvince.equals(deliveryProvince)) {
            return BigDecimal.ZERO; // Miễn phí vận chuyển cùng tỉnh
        } else {
            return SHIPPING_COST; // 30,000 VND cho khác tỉnh
        }
    }

    @Transactional
    public BigDecimal applyVoucherToOrder(Order order, Long voucherId, User user) {
        try {
            // Lấy thông tin voucher từ database
            DiscountCode discountCode = discountCodeRepository.findById(voucherId)
                    .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy mã giảm giá"));

            // Log thông tin voucher
            log.info("Applying voucher {} to order {}", discountCode.getCode(), order.getId());
            log.info("Voucher type: {}, applies to: {}", discountCode.getDiscountType(), discountCode.getAppliesTo());

            // Lấy danh sách OrderItems của order
            List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());

            // ✅ FIX: Tính toán discount amount (áp dụng trên giá đã có Flash Sale)
            BigDecimal discountAmount = calculateDiscountForOrder(discountCode, orderItems);

            log.info("Calculated discount amount: {} for order {}", discountAmount, order.getId());

            if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                // Set discountCode trong Order entity
                order.setDiscountCode(discountCode);

                // Lưu thông tin discount vào OrderDiscount
                OrderDiscount orderDiscount = OrderDiscount.builder()
                        .order(order)
                        .discountCode(discountCode)
                        .discountAmount(discountAmount)
                        .originalAmount(order.getTotalAmount()) // Total amount đã bao gồm shipping
                        .finalAmount(order.getTotalAmount().subtract(discountAmount))
                        .appliedAt(LocalDateTime.now())
                        .build();

                orderDiscountRepository.save(orderDiscount);

                log.info("Successfully applied voucher {} to order {}, discount amount: {}",
                        discountCode.getCode(), order.getId(), discountAmount);

                return discountAmount;
            } else {
                log.warn("No discount applied for voucher {} on order {}",
                        discountCode.getCode(), order.getId());
                throw new ExCustom(HttpStatus.BAD_REQUEST, "Không thể áp dụng mã giảm giá cho đơn hàng này");
            }
        } catch (Exception e) {
            log.error("Error applying voucher {} to order {}: {}", voucherId, order.getId(), e.getMessage());
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Không thể áp dụng mã giảm giá: " + e.getMessage());
        }
    }

    /**
     * ✅ FIX: Tính toán discount amount cho order dựa trên loại voucher
     * SỬ DỤNG GIÁ ĐÃ LƯU TRONG ORDER ITEM (đã bao gồm Flash Sale)
     */
    private BigDecimal calculateDiscountForOrder(DiscountCode discountCode, List<OrderItem> orderItems) {
        BigDecimal discountAmount = BigDecimal.ZERO;

        // ✅ FIX: Tính tổng giá trị đơn hàng từ priceAtTime (đã bao gồm flash sale)
        BigDecimal orderTotal = orderItems.stream()
                .map(item -> {
                    BigDecimal itemTotal = item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity()));

                    // Thêm giá addon nếu có
                    List<OrderItemAddon> addons = orderItemAddonService.getByOrderItem(item);
                    BigDecimal addonTotal = addons.stream()
                            .map(OrderItemAddon::getPriceAdjustAtTime)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return itemTotal.add(addonTotal);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Order total (with flash sale already applied, without shipping): {}", orderTotal);

        // Kiểm tra minimum order amount
        if (orderTotal.compareTo(discountCode.getMinOrderAmount()) < 0) {
            log.warn("Order total {} is less than minimum required {}",
                    orderTotal, discountCode.getMinOrderAmount());
            return BigDecimal.ZERO;
        }

        if (discountCode.getAppliesTo() == AppliesTo.SHOP) {
            // Voucher áp dụng cho toàn shop
            discountAmount = discountCode.calculateDiscountAmount(orderTotal);
            log.info("Shop discount calculated: {}", discountAmount);
        } else if (discountCode.getAppliesTo() == AppliesTo.PRODUCTS) {
            // ✅ FIX: Voucher áp dụng cho sản phẩm cụ thể - sử dụng giá đã có Flash Sale
            discountAmount = calculateProductsDiscountWithExistingPrices(discountCode, orderItems);
            log.info("Products discount calculated: {}", discountAmount);
        }

        // Đảm bảo discount không vượt quá tổng giá trị đơn hàng
        return discountAmount.min(orderTotal);
    }

    /**
     * ✅ FIX: Tính discount cho voucher loại PRODUCTS với giá đã áp dụng Flash Sale
     * SỬ DỤNG priceAtTime thay vì tính lại Flash Sale
     */
    private BigDecimal calculateProductsDiscountWithExistingPrices(DiscountCode discountCode, List<OrderItem> orderItems) {
        BigDecimal totalDiscount = BigDecimal.ZERO;

        // Lấy danh sách product IDs mà voucher áp dụng
        List<Long> voucherProductIds = discountCode.getProducts().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        log.info("Voucher applies to products: {}", voucherProductIds);

        // Duyệt qua từng OrderItem
        for (OrderItem orderItem : orderItems) {
            Long productId = orderItem.getVariant().getProduct().getId();

            // Kiểm tra xem product này có được áp dụng voucher không
            if (voucherProductIds.contains(productId)) {
                log.info("Product {} is eligible for discount", productId);

                // ✅ FIX: Sử dụng giá đã lưu (đã bao gồm Flash Sale) thay vì tính lại
                BigDecimal itemTotalWithExistingPrice = orderItem.getPriceAtTime().multiply(BigDecimal.valueOf(orderItem.getQuantity()));

                // Thêm giá addon nếu có
                List<OrderItemAddon> addons = orderItemAddonService.getByOrderItem(orderItem);
                BigDecimal addonTotal = addons.stream()
                        .map(OrderItemAddon::getPriceAdjustAtTime)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                itemTotalWithExistingPrice = itemTotalWithExistingPrice.add(addonTotal);

                BigDecimal itemDiscount = BigDecimal.ZERO;

                if (discountCode.getDiscountType() == DiscountType.PERCENTAGE) {
                    // Giảm % cho sản phẩm này (trên giá đã có trong OrderItem)
                    itemDiscount = itemTotalWithExistingPrice.multiply(discountCode.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

                    // Áp dụng max discount cho mỗi sản phẩm nếu có
                    if (discountCode.getMaxDiscountValue() != null &&
                            itemDiscount.compareTo(discountCode.getMaxDiscountValue()) > 0) {
                        itemDiscount = discountCode.getMaxDiscountValue();
                    }
                } else {
                    // FIXED_AMOUNT - Giảm số tiền cố định cho MỖI số lượng sản phẩm
                    BigDecimal discountPerUnit = discountCode.getDiscountValue();
                    itemDiscount = discountPerUnit.multiply(BigDecimal.valueOf(orderItem.getQuantity()));

                    // Đảm bảo không giảm quá giá trị sản phẩm (đã có Flash Sale)
                    itemDiscount = itemDiscount.min(itemTotalWithExistingPrice);
                }

                log.info("Item discount for product {}: {} (quantity: {}, using existing price with flash sale)",
                        productId, itemDiscount, orderItem.getQuantity());
                totalDiscount = totalDiscount.add(itemDiscount);
            }
        }

        log.info("Total products discount calculated (using existing prices): {}", totalDiscount);
        return totalDiscount;
    }

    @Transactional
    public OrderResult handleOrderPaymentVNPay(Map<String, String> params, List<Long> orderIds) {
        String vnpTxnRef = params.get("vnp_TxnRef"); // Base transaction code từ VNPay
        String transactionCodeFromVNPay = params.get("vnp_TransactionNo");
        String responseCode = params.get("vnp_ResponseCode");

        List<Order> orders = orderRepository.findByIdIn(orderIds);
        String status = "";
        String message = "";
        Long userId = orders.getFirst().getCustomer().getId();

        for (Order order : orders) {
            // Tạo transaction code theo format mới: baseTxnRef + "-" + orderId
            String expectedTxnRef = vnpTxnRef + "-" + order.getId();

            PaymentTransaction transaction = paymentTransactionRepository
                    .findByOrderIdAndTransactionCode(order.getId(), expectedTxnRef)
                    .orElseThrow(() -> new ExCustom(HttpStatus.BAD_REQUEST,
                            "Không tìm thấy giao dịch cho order " + order.getId() + " với code " + expectedTxnRef));

            // Lưu VNPay response vào gateway_response
            if (transactionCodeFromVNPay != null && !"0".equals(transactionCodeFromVNPay)) {
                transaction.setGatewayResponse("VNPAY-" + transactionCodeFromVNPay);
            } else {
                transaction.setGatewayResponse("VNPAY-FAIL-" + System.currentTimeMillis());
            }

            transaction.setPaidAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            if ("00".equals(responseCode)) {
                // Kiểm tra tồn kho trước khi trừ
                validateAndUpdateStock(order);

                // ✅ CẬP NHẬT FLASH SALE SOLD COUNT KHI THANH TOÁN THÀNH CÔNG
                updateFlashSaleSoldCountForOrder(order);

                transaction.setStatus(TransactionStatus.COMPLETED);
                balanceTransferService.processOrderStatusChange(order, OrderStatus.PROCESSING);
                message = "Thanh toán thành công";

                // Xác nhận sử dụng voucher nếu có
                confirmVoucherUsage(order);

                // Tạo delivery assignment sau khi thanh toán thành công
                createDeliveryAssignment(order);

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
                transaction.setStatus(TransactionStatus.FAILED);
                balanceTransferService.processOrderStatusChange(order, OrderStatus.CANCELLED);
                message = "Thanh toán thất bại";
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

    private void updateFlashSaleSoldCountForOrder(Order order) {
        log.info("Updating Flash Sale sold count for order: {}", order.getId());

        List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
        for (OrderItem item : orderItems) {
            ProductVariant variant = item.getVariant();
            Long productId = variant.getProduct().getId();
            int quantity = item.getQuantity();

            // Cập nhật Flash Sale sold count
            flashSaleHelper.updateFlashSaleSoldCount(productId, quantity);

            log.info("Updated Flash Sale sold count for product {}: +{} items",
                    variant.getProduct().getName(), quantity);
        }
    }

    /**
     * Tạo delivery assignment cho order sau khi thanh toán thành công
     */
    public void createDeliveryAssignment(Order order) {
        try {
            // Tính thời gian giao hàng dự kiến
            LocalDateTime estimatedDelivery = calculateEstimatedDeliveryTime(order);

            DeliveryAssignment assignment = DeliveryAssignment.builder()
                    .order(order)
                    .status(DeliveryStatus.AVAILABLE)
                    .estimatedDelivery(estimatedDelivery)
                    .build();

            deliveryAssignmentRepository.save(assignment);

            log.info("Created delivery assignment for order {}", order.getId());
        } catch (Exception e) {
            log.error("Error creating delivery assignment for order {}: {}", order.getId(), e.getMessage());
            // Không throw exception để không ảnh hưởng đến payment process
        }
    }

    /**
     * Tính thời gian giao hàng dự kiến dựa trên địa chỉ
     */
    private LocalDateTime calculateEstimatedDeliveryTime(Order order) {
        OrderShipping orderShipping = orderShippingRepository.findByOrder(order);
        if (orderShipping == null) {
            return LocalDateTime.now().plusDays(2); // Default 2 days
        }

        String pickupProvince = orderShipping.getPickupProvince();
        String deliveryProvince = orderShipping.getDeliveryProvince();

        if (pickupProvince.equals(deliveryProvince)) {
            // Cùng tỉnh: 6-12 giờ
            return LocalDateTime.now().plusHours(8);
        } else {
            // Khác tỉnh: 2-3 ngày
            return LocalDateTime.now().plusDays(2);
        }
    }

    private void validateAndUpdateStock(Order order) {
        List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());

        // Validate stock
        for (OrderItem item : orderItems) {
            ProductVariant variant = item.getVariant();
            int requiredQuantity = item.getQuantity();
            if (variant.getStockQuantity() < requiredQuantity) {
                throw new ExCustom(HttpStatus.BAD_REQUEST,
                        "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
            }
        }

        // Update stock
        for (OrderItem item : orderItems) {
            ProductVariant variant = item.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productService.updateProductVariant(variant);
        }
    }

    protected void confirmVoucherUsage(Order order) {
        OrderDiscount orderDiscount = orderDiscountRepository.findByOrderId(order.getId());
        if (orderDiscount != null) {
            DiscountCode discountCode = orderDiscount.getDiscountCode();

            // Ghi nhận việc sử dụng discount bởi user
            recordDiscountUsage(order.getCustomer().getId(), discountCode.getId());

            // Gọi service để confirm discount usage (cho business logic khác nếu có)
            discountCodeService.confirmDiscountUsage(
                    discountCode.getCode(),
                    order.getCustomer().getId(),
                    order.getId(),
                    orderDiscount.getDiscountAmount(),
                    orderDiscount.getOriginalAmount()
            );

            log.info("Confirmed voucher usage: {} for order {}, new usedCount: {}",
                    discountCode.getCode(), order.getId(), discountCode.getUsedCount());
        }
    }

    // START ================= HỦY ĐƠN =======================================

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng đã bị hủy");
        }

        balanceTransferService.refundToCustomer(order);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Restore stock if order was processing
        if (order.getStatus() == OrderStatus.PROCESSING) {
            List<OrderItem> orderItems = orderItemRepo.findByOrderId(orderId);
            for (OrderItem item : orderItems) {
                ProductVariant variant = item.getVariant();

                // Hoàn nguyên tồn kho
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                productService.updateProductVariant(variant);

                // ✅ HOÀN NGUYÊN FLASH SALE SOLD COUNT
                flashSaleHelper.revertFlashSaleSoldCount(variant.getProduct().getId(), item.getQuantity());

                log.info("Reverted stock and flash sale for product {}: restored {} items",
                        variant.getProduct().getName(), item.getQuantity());
            }
        }
    }

    // END  ========================= HỦY ĐƠN =================================//

    // START ======================== MUA LẠI =================================//

    // Thêm method này vào OrderService
    @Transactional
    public OrderPageResponse buyAgain(Long orderId, User user) {
        // Lấy và validate đơn hàng gốc
        Order originalOrder = validateOriginalOrder(orderId, user);

        // Lấy và validate OrderItems
        List<OrderItem> originalOrderItems = validateOrderItems(orderId);

        // Tạo đơn hàng mới
        Order newOrder = createNewOrder(originalOrder, user);

        // ✅ FIX: Tạo OrderItems và tính toán giá với Flash Sale hiện tại
        OrderCreationResult result = createOrderItemsFromOriginalWithCurrentFlashSale(newOrder, originalOrderItems);

        // Cập nhật tổng tiền và lưu
        BigDecimal shippingCost = BigDecimal.valueOf(30000);
        newOrder.setTotalAmount(result.getTotalAmount().add(shippingCost));
        update(newOrder);

        // Lấy voucher khả dụng
        List<DiscountCodeDTO> availableVouchers = getAvailableVouchers(newOrder, originalOrderItems, user);

        // Tạo response
        return createOrderPageResponse(newOrder, result.getOrderItemResponses(), shippingCost, availableVouchers);
    }

    private Order validateOriginalOrder(Long orderId, User user) {
        Order originalOrder = getOrderById(orderId);
        if (originalOrder == null || !originalOrder.getCustomer().getId().equals(user.getId())) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
        }

        // Validate trạng thái đơn hàng - chỉ cho phép mua lại các đơn hàng đã hoàn thành
        if (!isOrderEligibleForBuyAgain(originalOrder.getStatus())) {
            throw new ExCustom(HttpStatus.BAD_REQUEST,
                    "Không thể mua lại đơn hàng với trạng thái: " + originalOrder.getStatus() +
                            ". Chỉ có thể mua lại đơn hàng đã HOÀN THÀNH, HỦY hoặc TRẢ HÀNG");
        }

        return originalOrder;
    }

    private boolean isOrderEligibleForBuyAgain(OrderStatus status) {
        return status == OrderStatus.CONFIRMED ||
                status == OrderStatus.CANCELLED ||
                status == OrderStatus.RETURNED;
    }

    private List<OrderItem> validateOrderItems(Long orderId) {
        List<OrderItem> originalOrderItems = orderItemService.getOrderItems(orderId);
        if (originalOrderItems.isEmpty()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng không có sản phẩm");
        }
        return originalOrderItems;
    }

    private Order createNewOrder(Order originalOrder, User user) {
        Order newOrder = Order.builder()
                .customer(user)
                .store(originalOrder.getStore())
                .status(OrderStatus.PENDING)
                .shippingMethod(originalOrder.getShippingMethod())
                .paymentMethod(originalOrder.getPaymentMethod())
                .totalAmount(BigDecimal.ZERO)
                .note("Mua lại từ đơn hàng #" + originalOrder.getId())
                .build();

        return save(newOrder);
    }

    /**
     * ✅ FIX: Tạo OrderItems từ original với flash sale HIỆN TẠI
     * CHỈ TÍNH FLASH SALE KHI TẠO ĐƠN HÀNG MỚI (MUA LẠI)
     */
    private OrderCreationResult createOrderItemsFromOriginalWithCurrentFlashSale(Order newOrder, List<OrderItem> originalOrderItems) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItemResponse> orderItemResponses = new ArrayList<>();

        for (OrderItem originalOrderItem : originalOrderItems) {
            ProductVariant variant = originalOrderItem.getVariant();
            Product product = variant.getProduct();
            int quantity = originalOrderItem.getQuantity();

            // ✅ TÍNH GIÁ HIỆN TẠI với Flash Sale (nếu có) - CHỈ KHI MUA LẠI
            BigDecimal currentPriceWithFlashSale = flashSaleHelper.calculateFlashSalePrice(variant, quantity);
            BigDecimal itemTotal = currentPriceWithFlashSale.multiply(BigDecimal.valueOf(quantity));

            // Tạo OrderItem mới với giá hiện tại
            OrderItem newOrderItem = OrderItem.builder()
                    .variant(variant)
                    .order(newOrder)
                    .quantity(quantity)
                    .priceAtTime(currentPriceWithFlashSale) // ✅ LƯU GIÁ ĐÃ BAO GỒM FLASH SALE
                    .build();

            orderItemService.save(newOrderItem);

            // Xử lý addons
            List<OrderItemAddonResponse> addonResponses = processOrderItemAddons(newOrderItem, originalOrderItem);
            BigDecimal addonTotal = addonResponses.stream()
                    .map(OrderItemAddonResponse::getPriceAdjust)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            itemTotal = itemTotal.add(addonTotal);

            // Tạo response
            OrderItemResponse orderItemResponse = createOrderItemResponse(newOrderItem, addonResponses, itemTotal);
            orderItemResponses.add(orderItemResponse);
            totalAmount = totalAmount.add(itemTotal);
        }

        return new OrderCreationResult(totalAmount, orderItemResponses);
    }

    private List<OrderItemAddonResponse> processOrderItemAddons(OrderItem newOrderItem, OrderItem originalOrderItem) {
        List<OrderItemAddon> originalAddons = orderItemAddonService.getByOrderItem(originalOrderItem);
        List<OrderItemAddonResponse> addonResponses = new ArrayList<>();

        for (OrderItemAddon originalAddon : originalAddons) {
            Addon addon = originalAddon.getAddon();
            if (addon != null && addon.isActive()) {
                BigDecimal currentAddonPrice = addon.getPriceAdjust();

                OrderItemAddon newOrderItemAddon = OrderItemAddon.builder()
                        .orderItem(newOrderItem)
                        .addon(addon)
                        .priceAdjustAtTime(currentAddonPrice)
                        .build();
                orderItemAddonService.save(newOrderItemAddon);

                OrderItemAddonResponse addonDTO = new OrderItemAddonResponse();
                addonDTO.setAddonName(addon.getName());
                addonDTO.setAddonGroupName(addon.getAddonGroup().getName());
                addonDTO.setPriceAdjust(currentAddonPrice);
                addonResponses.add(addonDTO);
            }
        }

        return addonResponses;
    }

    private OrderItemResponse createOrderItemResponse(OrderItem orderItem, List<OrderItemAddonResponse> addonResponses, BigDecimal itemTotal) {
        ProductVariant variant = orderItem.getVariant();
        Product product = variant.getProduct();
        Store store = orderItem.getOrder().getStore();

        // Tạo store response
        OrderStoreResponse orderStoreResponse = new OrderStoreResponse();
        orderStoreResponse.setId(store.getId());
        orderStoreResponse.setName(store.getName());
        orderStoreResponse.setImage(store.getLogoUrl());

        // Tạo product response
        OrderProductResponse orderProductResponse = new OrderProductResponse();
        orderProductResponse.setId(product.getId());
        orderProductResponse.setName(product.getName());
        orderProductResponse.setThumbnailUrl(product.getThumbnailUrl());
        orderProductResponse.setDescription(product.getDescription());
        orderProductResponse.setSlug(product.getSlug());
        orderProductResponse.setIsActive(product.isActive());
        orderProductResponse.setCategory(categoryMapper.toDto(product.getCategory()));
        orderProductResponse.setItemType(itemTypeMapper.toDto(product.getItemType()));

        // Tạo variant response
        OrderProductVariantResponse orderProductVariantResponse = new OrderProductVariantResponse();
        orderProductVariantResponse.setId(variant.getId());
        orderProductVariantResponse.setProduct(orderProductResponse);
        orderProductVariantResponse.setAltText(variant.getProduct().getName());
        orderProductVariantResponse.setImageUrl(variant.getImageUrl());
        orderProductVariantResponse.setSku(variant.getSku());
        orderProductVariantResponse.setIsActive(variant.isActive());
        orderProductVariantResponse.setStockQuantity(variant.getStockQuantity());
        orderProductVariantResponse.setPrice(variant.getPrice());
        orderProductVariantResponse.setStore(orderStoreResponse);

        // Tạo order item response
        OrderItemResponse orderItemResponse = new OrderItemResponse();
        orderItemResponse.setId(orderItem.getId());
        orderItemResponse.setProductVariant(orderProductVariantResponse);
        orderItemResponse.setQuantity(orderItem.getQuantity());
        orderItemResponse.setPriceAtTime(orderItem.getPriceAtTime());
        orderItemResponse.setCreatedAt(orderItem.getCreatedAt());
        orderItemResponse.setUpdatedAt(orderItem.getUpdatedAt());
        orderItemResponse.setAddons(addonResponses);
        orderItemResponse.setTotalItemPrice(itemTotal);

        // ✅ THÊM THÔNG TIN FLASH SALE
        OrderItemFlashSaleInfo flashSaleInfo = getFlashSaleInfoForOrderItem(orderItem);
        if (flashSaleInfo != null) {
            // Set flash sale info vào response
            orderItemResponse.setFlashSale(flashSaleInfo);

            // Tính original price (giá gốc trước khi giảm flash sale)
            BigDecimal originalPrice = variant.getPrice();
            orderItemResponse.setOriginalPrice(originalPrice);

            // Set flag có flash sale
            orderItemResponse.setHasFlashSale(true);
        } else {
            orderItemResponse.setHasFlashSale(false);
        }

        return orderItemResponse;
    }

    private List<DiscountCodeDTO> getAvailableVouchers(Order newOrder, List<OrderItem> originalOrderItems, User user) {
        List<Long> productIds = originalOrderItems.stream()
                .map(item -> item.getVariant().getProduct().getId())
                .collect(Collectors.toList());

        return discountCodeService.getApplicableDiscountCodesWithContext(
                newOrder.getStore().getId(), productIds, user.getId());
    }

    private OrderPageResponse createOrderPageResponse(Order newOrder, List<OrderItemResponse> orderItemResponses,
                                                      BigDecimal shippingCost, List<DiscountCodeDTO> availableVouchers) {
        Store store = newOrder.getStore();
        OrderStoreResponse orderStoreResponse = new OrderStoreResponse();
        orderStoreResponse.setId(store.getId());
        orderStoreResponse.setName(store.getName());
        orderStoreResponse.setImage(store.getLogoUrl());

        // ✅ TÍNH TOÁN THÔNG TIN FLASH SALE CHO TOÀN ĐƠN HÀNG
        boolean hasFlashSaleItems = false;
        BigDecimal totalFlashSavings = BigDecimal.ZERO;
        int flashSaleItemCount = 0;

        for (OrderItemResponse item : orderItemResponses) {
            if (item.getHasFlashSale() != null && item.getHasFlashSale()) {
                hasFlashSaleItems = true;
                flashSaleItemCount++;

                // Tính tiền tiết kiệm từ flash sale
                if (item.getOriginalPrice() != null) {
                    BigDecimal originalTotal = item.getOriginalPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal flashSaleTotal = item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal savings = originalTotal.subtract(flashSaleTotal);
                    totalFlashSavings = totalFlashSavings.add(savings);
                }
            }
        }

        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(newOrder.getId());
        orderResponse.setStore(orderStoreResponse);
        orderResponse.setStatus(newOrder.getStatus());
        orderResponse.setShippingMethod(newOrder.getShippingMethod());
        orderResponse.setPaymentMethod(newOrder.getPaymentMethod());
        orderResponse.setTotalAmount(newOrder.getTotalAmount());
        orderResponse.setNote(newOrder.getNote());
        orderResponse.setCreatedAt(newOrder.getCreatedAt());
        orderResponse.setUpdatedAt(newOrder.getUpdatedAt());
        orderResponse.setOrderItemResponses(orderItemResponses);
        orderResponse.setShippingCost(shippingCost);
        orderResponse.setAvailableVouchers(availableVouchers);

        // ✅ SET THÔNG TIN FLASH SALE
        orderResponse.setHasFlashSaleItems(hasFlashSaleItems);
        orderResponse.setTotalFlashSavings(totalFlashSavings);
        orderResponse.setFlashSaleItemCount(flashSaleItemCount);

        OrderPageResponse orderPageResponse = new OrderPageResponse();
        orderPageResponse.setOrderResponse(List.of(orderResponse));

        return orderPageResponse;
    }

    // Inner class để wrap kết quả
    private static class OrderCreationResult {
        private final BigDecimal totalAmount;
        private final List<OrderItemResponse> orderItemResponses;

        public OrderCreationResult(BigDecimal totalAmount, List<OrderItemResponse> orderItemResponses) {
            this.totalAmount = totalAmount;
            this.orderItemResponses = orderItemResponses;
        }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public List<OrderItemResponse> getOrderItemResponses() { return orderItemResponses; }
    }

    // END ======================== MUA LẠI =================================//
}