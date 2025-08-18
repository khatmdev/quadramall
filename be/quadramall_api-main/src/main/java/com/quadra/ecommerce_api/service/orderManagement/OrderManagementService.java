package com.quadra.ecommerce_api.service.orderManagement;

import com.quadra.ecommerce_api.dto.custom.orderManagerment.request.OrderFilterRequest;
import com.quadra.ecommerce_api.dto.custom.orderManagerment.response.*;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.shipping.OrderShippingRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderManagementService {

    private final OrderRepo orderRepository;
    private final OrderItemRepo orderItemRepository;
    private final OrderShippingRepo orderShippingRepository;
    private final StoreRepo storeRepository;

    /**
     * Get order statistics for seller dashboard (specific store or all stores)
     */
    @Transactional(readOnly = true)
    public OrderStatsResponse getOrderStats(Long userId, Long storeId) {
        log.info("Getting order stats for user: {} and store: {}", userId, storeId);

        List<Store> stores = getUserStores(userId);

        // If storeId is provided, filter to that specific store
        List<Store> targetStores = storeId != null ?
                stores.stream().filter(store -> store.getId().equals(storeId)).collect(Collectors.toList()) :
                stores;

        if (targetStores.isEmpty()) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy cửa hàng");
        }

        // Get all orders for target stores
        List<Order> allOrders = new ArrayList<>();
        for (Store store : targetStores) {
            allOrders.addAll(orderRepository.findByStoreIdOrderByCreatedAtDesc(store.getId()));
        }

        // Calculate stats
        long totalOrders = allOrders.size();
        long pendingOrders = countOrdersByStatus(allOrders, OrderStatus.PENDING);
        long processingOrders = countOrdersByStatus(allOrders, OrderStatus.PROCESSING);
        long confirmedPreparingOrders = countOrdersByStatus(allOrders, OrderStatus.CONFIRMED_PREPARING);
        long assignedToShipperOrders = countOrdersByStatus(allOrders, OrderStatus.ASSIGNED_TO_SHIPPER);
        long deliveredOrders = countOrdersByStatus(allOrders, OrderStatus.DELIVERED);
        long cancelledOrders = countOrdersByStatus(allOrders, OrderStatus.CANCELLED);

        // Calculate revenue
        BigDecimal totalRevenue = calculateTotalRevenue(allOrders);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        BigDecimal monthlyRevenue = calculateRevenueFromDate(allOrders, startOfMonth);
        BigDecimal weeklyRevenue = calculateRevenueFromDate(allOrders, startOfWeek);

        OrderStatsResponse stats = OrderStatsResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .processingOrders(processingOrders)
                .confirmedPreparingOrders(confirmedPreparingOrders)
                .assignedToShipperOrders(assignedToShipperOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .weeklyRevenue(weeklyRevenue)
                .build();

        log.info("Generated stats for {} stores: {} total orders, {} revenue",
                targetStores.size(), totalOrders, totalRevenue);

        return stats;
    }

    /**
     * Get paginated list of orders with filtering (specific store or all stores)
     */
    @Transactional(readOnly = true)
    public OrderListResponse getOrders(Long userId, Long storeId, Pageable pageable, OrderFilterRequest filter) {
        log.info("Getting orders for user: {}, store: {} with filters: {}", userId, storeId, filter);

        List<Store> stores = getUserStores(userId);

        // Build specification for filtering
        Specification<Order> spec = buildOrderSpecification(stores, storeId, filter);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<OrderSummaryResponse> orderSummaries = orderPage.getContent().stream()
                .map(this::mapToOrderSummary)
                .collect(Collectors.toList());

        OrderListResponse response = OrderListResponse.builder()
                .orders(orderSummaries)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .currentPage(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();

        log.info("Retrieved {} orders for user {}", orderSummaries.size(), userId);

        return response;
    }

    /**
     * Get detailed information about a specific order
     */
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(Long userId, Long orderId) {
        log.info("Getting order detail for user: {} and order: {}", userId, orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        // Verify order belongs to one of user's stores
        validateOrderOwnership(userId, order);

        // Get order items with full details
        List<OrderItem> orderItems = orderItemRepository.findByOrderIdWithProductDetails(orderId);

        // Get shipping information
        OrderShipping shipping = orderShippingRepository.findByOrder(order);

        // Build detailed response
        OrderDetailResponse response = OrderDetailResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .shippingMethod(order.getShippingMethod())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .customer(mapToCustomerInfo(order.getCustomer()))
                .shipping(mapToShippingInfo(shipping))
                .items(orderItems.stream().map(this::mapToOrderItemDetail).collect(Collectors.toList()))
                .canUpdateStatus(canUpdateOrderStatus(order.getStatus()))
                .availableStatuses(getAvailableStatuses(order.getStatus()))
                .timeline(buildOrderTimeline(order))
                .build();

        log.info("Retrieved order detail for order: {}", orderId);

        return response;
    }

    /**
     * Update order status with validation
     */
    public void updateOrderStatus(Long userId, Long orderId, OrderStatus newStatus, String note) {
        log.info("Updating order {} status to {} by user {}", orderId, newStatus, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        // Verify ownership
        validateOrderOwnership(userId, order);

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        // Update order
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        if (note != null && !note.trim().isEmpty()) {
            String existingNote = order.getNote() != null ? order.getNote() : "";
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            order.setNote(existingNote.isEmpty() ?
                    String.format("[%s] %s", timestamp, note) :
                    existingNote + "\n" + String.format("[%s] %s", timestamp, note));
        }

        orderRepository.save(order);

        log.info("Successfully updated order {} status to {} by user {}",
                orderId, newStatus, userId);
    }

    /**
     * Update multiple orders status (batch operation)
     */
    public void updateMultipleOrderStatus(Long userId, List<Long> orderIds, OrderStatus newStatus, String note) {
        log.info("Updating {} orders status to {} by user {}", orderIds.size(), newStatus, userId);

        List<Order> orders = orderRepository.findAllById(orderIds);

        // Verify all orders belong to user's stores
        for (Order order : orders) {
            validateOrderOwnership(userId, order);
        }

        // Validate all orders have the same current status
        OrderStatus currentStatus = null;
        for (Order order : orders) {
            if (currentStatus == null) {
                currentStatus = order.getStatus();
            } else if (!currentStatus.equals(order.getStatus())) {
                throw new ExCustom(HttpStatus.BAD_REQUEST, "Tất cả đơn hàng phải có cùng trạng thái hiện tại để cập nhật hàng loạt");
            }
        }

        // Validate status transition
        if (currentStatus != null) {
            validateStatusTransition(currentStatus, newStatus);
        }

        // Update all orders
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        for (Order order : orders) {
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());

            if (note != null && !note.trim().isEmpty()) {
                String existingNote = order.getNote() != null ? order.getNote() : "";
                order.setNote(existingNote.isEmpty() ?
                        String.format("[%s] %s", timestamp, note) :
                        existingNote + "\n" + String.format("[%s] %s", timestamp, note));
            }
        }

        orderRepository.saveAll(orders);

        log.info("Successfully updated {} orders status from {} to {} by user {}",
                orders.size(), currentStatus, newStatus, userId);
    }

    /**
     * Confirm order (PROCESSING -> CONFIRMED_PREPARING)
     */
    public void confirmOrder(Long userId, Long orderId, String note) {
        log.info("Confirming order {} by user {}", orderId, userId);
        updateOrderStatus(userId, orderId, OrderStatus.CONFIRMED_PREPARING,
                note != null ? note : "Đơn hàng đã được xác nhận và đang chuẩn bị hàng");
    }

    /**
     * Prepare order for shipping (CONFIRMED_PREPARING -> ASSIGNED_TO_SHIPPER)
     */
    public void prepareOrder(Long userId, Long orderId, String note) {
        log.info("Preparing order {} for shipping by user {}", orderId, userId);
        updateOrderStatus(userId, orderId, OrderStatus.ASSIGNED_TO_SHIPPER,
                note != null ? note : "Đã hoàn thành chuẩn bị hàng, chờ shipper đến lấy");
    }

    /**
     * Cancel order with reason
     */
    public void cancelOrder(Long userId, Long orderId, String reason) {
        log.info("Cancelling order {} by user {} with reason: {}", orderId, userId, reason);

        if (reason == null || reason.trim().isEmpty()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do hủy đơn hàng");
        }

        updateOrderStatus(userId, orderId, OrderStatus.CANCELLED, "Lý do hủy: " + reason);
    }

    /**
     * Get order timeline/history
     */
    @Transactional(readOnly = true)
    public List<OrderTimelineResponse> getOrderTimeline(Long userId, Long orderId) {
        log.info("Getting timeline for order {} by user {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        validateOrderOwnership(userId, order);

        return buildOrderTimeline(order);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Get all stores owned by user
     */
    private List<Store> getUserStores(Long userId) {
        List<Store> stores = storeRepository.findByOwnerId(userId);
        if (stores.isEmpty()) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Bạn chưa có cửa hàng nào");
        }
        return stores;
    }

    /**
     * Validate that the order belongs to one of user's stores
     */
    private void validateOrderOwnership(Long userId, Order order) {
        List<Store> userStores = getUserStores(userId);
        boolean isOwner = userStores.stream()
                .anyMatch(store -> store.getId().equals(order.getStore().getId()));

        if (!isOwner) {
            throw new ExCustom(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập đơn hàng này");
        }
    }

    /**
     * Count orders by status
     */
    private long countOrdersByStatus(List<Order> orders, OrderStatus status) {
        return orders.stream()
                .filter(order -> order.getStatus() == status)
                .count();
    }

    /**
     * Calculate total revenue excluding cancelled/returned orders
     */
    private BigDecimal calculateTotalRevenue(List<Order> orders) {
        return orders.stream()
                .filter(order -> !isExcludedFromRevenue(order.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate revenue from specific date
     */
    private BigDecimal calculateRevenueFromDate(List<Order> orders, LocalDateTime fromDate) {
        return orders.stream()
                .filter(order -> !isExcludedFromRevenue(order.getStatus()))
                .filter(order -> order.getCreatedAt().isAfter(fromDate))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Check if order status should be excluded from revenue calculation
     */
    private boolean isExcludedFromRevenue(OrderStatus status) {
        return status == OrderStatus.CANCELLED || status == OrderStatus.RETURNED;
    }

    /**
     * Build JPA Specification for order filtering
     */
    private Specification<Order> buildOrderSpecification(List<Store> userStores, Long storeId, OrderFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by user's stores
            if (storeId != null) {
                // Specific store - validate it belongs to user
                boolean isValidStore = userStores.stream()
                        .anyMatch(store -> store.getId().equals(storeId));
                if (!isValidStore) {
                    throw new ExCustom(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập cửa hàng này");
                }
                predicates.add(cb.equal(root.get("store").get("id"), storeId));
            } else {
                // All user's stores
                List<Long> storeIds = userStores.stream()
                        .map(Store::getId)
                        .collect(Collectors.toList());
                predicates.add(root.get("store").get("id").in(storeIds));
            }

            // Status filter
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            // Date range filter
            if (filter.getStartDate() != null && !filter.getStartDate().isEmpty()) {
                try {
                    LocalDateTime startDate = LocalDateTime.parse(filter.getStartDate() + "T00:00:00");
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
                } catch (Exception e) {
                    log.warn("Invalid start date format: {}", filter.getStartDate());
                }
            }

            if (filter.getEndDate() != null && !filter.getEndDate().isEmpty()) {
                try {
                    LocalDateTime endDate = LocalDateTime.parse(filter.getEndDate() + "T23:59:59");
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
                } catch (Exception e) {
                    log.warn("Invalid end date format: {}", filter.getEndDate());
                }
            }

            // Customer name filter (case-insensitive)
            if (filter.getCustomerName() != null && !filter.getCustomerName().trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("customer").get("fullName")),
                        "%" + filter.getCustomerName().toLowerCase().trim() + "%"
                ));
            }

            // Order ID filter
            if (filter.getOrderId() != null && !filter.getOrderId().trim().isEmpty()) {
                try {
                    Long orderId = Long.parseLong(filter.getOrderId().trim());
                    predicates.add(cb.equal(root.get("id"), orderId));
                } catch (NumberFormatException e) {
                    // Invalid order ID, return no results
                    predicates.add(cb.equal(root.get("id"), -1L));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Map Order entity to OrderSummaryResponse
     */
    private OrderSummaryResponse mapToOrderSummary(Order order) {
        int totalItems = orderItemRepository.countByOrderId(order.getId());

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .customerName(order.getCustomer().getFullName())
                .customerPhone(order.getCustomer().getPhone())
                .status(order.getStatus())
                .shippingMethod(order.getShippingMethod())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .totalItems(totalItems)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .note(order.getNote())
                .canUpdateStatus(canUpdateOrderStatus(order.getStatus()))
                .nextStatus(getNextStatusLabel(order.getStatus()))
                .build();
    }

    /**
     * Map User entity to CustomerInfoResponse
     */
    private CustomerInfoResponse mapToCustomerInfo(User customer) {
        return CustomerInfoResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .avatarUrl(customer.getAvatarUrl())
                .build();
    }

    /**
     * Map OrderShipping entity to OrderShippingInfoResponse
     */
    private OrderShippingInfoResponse mapToShippingInfo(OrderShipping shipping) {
        if (shipping == null) {
            return null;
        }

        return OrderShippingInfoResponse.builder()
                .pickupAddress(shipping.getPickupAddress())
                .pickupWard(shipping.getPickupWard())
                .pickupDistrict(shipping.getPickupDistrict())
                .pickupProvince(shipping.getPickupProvince())
                .deliveryAddress(shipping.getDeliveryAddress())
                .deliveryWard(shipping.getDeliveryWard())
                .deliveryDistrict(shipping.getDeliveryDistrict())
                .deliveryProvince(shipping.getDeliveryProvince())
                .deliveryName(shipping.getDeliveryName())
                .shippingCost(shipping.getShippingCost())
                .build();
    }

    /**
     * Map OrderItem entity to OrderItemDetailResponse
     */
    private OrderItemDetailResponse mapToOrderItemDetail(OrderItem item) {
        BigDecimal totalPrice = item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity()));

        return OrderItemDetailResponse.builder()
                .id(item.getId())
                .productId(item.getVariant().getProduct().getId())
                .productName(item.getVariant().getProduct().getName())
                .productImage(item.getVariant().getImageUrl() != null ?
                        item.getVariant().getImageUrl() :
                        item.getVariant().getProduct().getThumbnailUrl())
                .variantName(item.getVariant().getSku())
                .sku(item.getVariant().getSku())
                .quantity(item.getQuantity())
                .priceAtTime(item.getPriceAtTime())
                .totalPrice(totalPrice)
                .build();
    }

    /**
     * Check if order status can be updated by seller
     */
    private boolean canUpdateOrderStatus(OrderStatus currentStatus) {
        return currentStatus == OrderStatus.PENDING ||
                currentStatus == OrderStatus.PROCESSING ||
                currentStatus == OrderStatus.CONFIRMED_PREPARING;
    }

    /**
     * Get available status transitions for current status
     */
    private List<OrderStatus> getAvailableStatuses(OrderStatus currentStatus) {
        switch (currentStatus) {
            case PENDING:
                return Arrays.asList(OrderStatus.PROCESSING, OrderStatus.CANCELLED);
            case PROCESSING:
                return Arrays.asList(OrderStatus.CONFIRMED_PREPARING, OrderStatus.CANCELLED);
            case CONFIRMED_PREPARING:
                return Arrays.asList(OrderStatus.ASSIGNED_TO_SHIPPER, OrderStatus.CANCELLED);
            default:
                return Collections.emptyList();
        }
    }

    /**
     * Get next status label for UI display
     */
    private String getNextStatusLabel(OrderStatus currentStatus) {
        switch (currentStatus) {
            case PENDING:
                return "Xử lý";
            case PROCESSING:
                return "Xác nhận";
            case CONFIRMED_PREPARING:
                return "Giao shipper";
            default:
                return null;
        }
    }

    /**
     * Validate if status transition is allowed
     */
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        List<OrderStatus> allowedStatuses = getAvailableStatuses(currentStatus);

        if (!allowedStatuses.contains(newStatus)) {
            throw new ExCustom(HttpStatus.BAD_REQUEST,
                    String.format("Không thể chuyển từ trạng thái '%s' sang '%s'. Các trạng thái có thể chuyển: %s",
                            currentStatus.getDisplayName(),
                            newStatus.getDisplayName(),
                            allowedStatuses.stream()
                                    .map(OrderStatus::getDisplayName)
                                    .collect(Collectors.joining(", "))));
        }
    }

    /**
     * Build order timeline from order data
     */
    private List<OrderTimelineResponse> buildOrderTimeline(Order order) {
        List<OrderTimelineResponse> timeline = new ArrayList<>();

        // Always add order created event
        timeline.add(OrderTimelineResponse.builder()
                .status(OrderStatus.PENDING)
                .statusDisplayName(OrderStatus.PENDING.getDisplayName())
                .description("Đơn hàng được tạo")
                .timestamp(order.getCreatedAt())
                .build());

        // Add current status if different from PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            timeline.add(OrderTimelineResponse.builder()
                    .status(order.getStatus())
                    .statusDisplayName(order.getStatus().getDisplayName())
                    .description(getStatusDescription(order.getStatus()))
                    .timestamp(order.getUpdatedAt())
                    .note(order.getNote())
                    .build());
        }

        // Sort by timestamp (oldest first)
        timeline.sort(Comparator.comparing(OrderTimelineResponse::getTimestamp));

        return timeline;
    }

    /**
     * Get description for order status
     */
    private String getStatusDescription(OrderStatus status) {
        switch (status) {
            case PENDING:
                return "Đơn hàng đang chờ xử lý";
            case PROCESSING:
                return "Đơn hàng đang được xử lý";
            case CONFIRMED_PREPARING:
                return "Đã xác nhận đơn hàng và đang chuẩn bị hàng";
            case ASSIGNED_TO_SHIPPER:
                return "Đã hoàn thành chuẩn bị, chờ shipper đến lấy hàng";
            case PICKED_UP:
                return "Shipper đã lấy hàng";
            case IN_TRANSIT:
                return "Đang vận chuyển";
            case DELIVERED:
                return "Đã giao hàng thành công";
            case CONFIRMED:
                return "Khách hàng đã xác nhận nhận hàng";
            case CANCELLED:
                return "Đơn hàng đã bị hủy";
            case RETURNED:
                return "Đơn hàng đã được trả lại";
            default:
                return status.getDisplayName();
        }
    }
}