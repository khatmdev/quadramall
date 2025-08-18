package com.quadra.ecommerce_api.service.shiping;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.dto.custom.shipping.request.*;
import com.quadra.ecommerce_api.dto.custom.shipping.response.*;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.shipping.*;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.shipping.*;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final ShipperRepository shipperRepository;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final OrderShippingRepo orderShippingRepository;
    private final OrderRepo orderRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public Page<AvailableOrderDTO> getAvailableOrders(User shipperUser, Pageable pageable) {
        Shipper shipper = shipperRepository.findByUserId(shipperUser.getId())
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin shipper"));


        Page<DeliveryAssignment> assignments = deliveryAssignmentRepository.findAvailableOrders(pageable);

        return assignments.map(this::mapToAvailableOrderDTO);
    }

    @Transactional
    public void acceptOrder(User shipperUser, Long orderId, AcceptOrderRequest request) {
        Shipper shipper = shipperRepository.findByUserId(shipperUser.getId())
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin shipper"));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (assignment.getStatus() != DeliveryStatus.AVAILABLE) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng không khả dụng để nhận");
        }

        // Kiểm tra số lượng đơn hàng đang xử lý của shipper
        Long activeDeliveries = deliveryAssignmentRepository.countActiveDeliveriesByShipper(shipper.getId());
        if (activeDeliveries >= 5) { // Giới hạn 5 đơn hàng cùng lúc
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Bạn đã có quá nhiều đơn hàng đang xử lý");
        }

        // Cập nhật assignment
        assignment.setShipper(shipper);
        assignment.setStatus(DeliveryStatus.ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setDeliveryNotes(request.getNotes());
        assignment.setEstimatedDelivery(calculateEstimatedDelivery(assignment.getOrder()));

        deliveryAssignmentRepository.save(assignment);

        // Cập nhật trạng thái order
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.ASSIGNED_TO_SHIPPER);
        orderRepository.save(order);

        // Gửi thông báo
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.ORDER_UPDATE,
                "Đơn hàng đã có shipper",
                "Đơn hàng #" + order.getId() + " đã được shipper " + shipper.getUser().getFullName() + " nhận",
                order.getId(),
                Notification.Priority.MEDIUM,
                Notification.Category.ORDER,
                "🚚"
        );

        // Gửi WebSocket notification
        messagingTemplate.convertAndSendToUser(
                order.getCustomer().getId().toString(),
                "/queue/order-updates",
                "Đơn hàng #" + order.getId() + " đã có shipper nhận"
        );

        log.info("Shipper {} accepted order {}", shipper.getId(), orderId);
    }

    @Transactional
    public void pickupOrder(User shipperUser, Long assignmentId) {
        DeliveryAssignment assignment = validateShipperAssignment(shipperUser, assignmentId);

        if (assignment.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng chưa được phân công");
        }

        assignment.setStatus(DeliveryStatus.PICKED_UP);
        assignment.setPickedUpAt(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);

        // Cập nhật trạng thái order
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.PICKED_UP);
        orderRepository.save(order);

        // Gửi thông báo
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.ORDER_UPDATE,
                "Đơn hàng đã được lấy",
                "Đơn hàng #" + order.getId() + " đã được shipper lấy và đang trên đường giao",
                order.getId(),
                Notification.Priority.MEDIUM,
                Notification.Category.ORDER,
                "📦"
        );

        log.info("Shipper picked up order {}", order.getId());
    }

    @Transactional
    public void startDelivery(User shipperUser, Long assignmentId) {
        DeliveryAssignment assignment = validateShipperAssignment(shipperUser, assignmentId);

        if (assignment.getStatus() != DeliveryStatus.PICKED_UP) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng chưa được lấy");
        }

        assignment.setStatus(DeliveryStatus.IN_TRANSIT);
        deliveryAssignmentRepository.save(assignment);

        // Cập nhật trạng thái order
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.IN_TRANSIT);
        orderRepository.save(order);

        // Gửi thông báo
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.ORDER_UPDATE,
                "Đơn hàng đang được giao",
                "Đơn hàng #" + order.getId() + " đang trên đường giao đến bạn",
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.ORDER,
                "🚛"
        );

        log.info("Shipper started delivery for order {}", order.getId());
    }

    @Transactional
    public String completeDelivery(User shipperUser, Long assignmentId, CompleteDeliveryRequest request) {
        DeliveryAssignment assignment = validateShipperAssignment(shipperUser, assignmentId);

        if (assignment.getStatus() != DeliveryStatus.IN_TRANSIT) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng chưa trong trạng thái vận chuyển");
        }

        // Tạo mã xác nhận ngẫu nhiên
        String confirmationCode = generateConfirmationCode();

        // Cập nhật assignment
        assignment.setStatus(DeliveryStatus.DELIVERED);
        assignment.setDeliveredAt(LocalDateTime.now());
        assignment.setActualDelivery(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);

        // Tạo delivery confirmation
        DeliveryConfirmation confirmation = DeliveryConfirmation.builder()
                .deliveryAssignment(assignment)
                .shipperConfirmedAt(LocalDateTime.now())
                .confirmationCode(confirmationCode)
                .deliveryProofUrl(request.getDeliveryProofUrl())
                .customerSignatureUrl(request.getCustomerSignatureUrl())
                .notes(request.getNotes())
                .build();

        deliveryConfirmationRepository.save(confirmation);

        // Cập nhật trạng thái order
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        // Gửi thông báo cho customer để xác nhận
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.ORDER_UPDATE,
                "Đơn hàng đã được giao",
                "Đơn hàng #" + order.getId() + " đã được giao. Vui lòng xác nhận nhận hàng với mã: " + confirmationCode,
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.ORDER,
                "✅"
        );

        log.info("Shipper completed delivery for order {}, confirmation code: {}", order.getId(), confirmationCode);

        return confirmationCode;
    }

    @Transactional
    public void confirmDeliveryByCustomer(User customer, Long orderId, String confirmationCode) {
        DeliveryConfirmation confirmation = deliveryConfirmationRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin giao hàng"));

        if (!confirmationCode.equals(confirmation.getConfirmationCode())) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Mã xác nhận không đúng");
        }

        if (confirmation.getCustomerConfirmedAt() != null) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng đã được xác nhận");
        }

        // Cập nhật confirmation
        confirmation.setCustomerConfirmedAt(LocalDateTime.now());
        deliveryConfirmationRepository.save(confirmation);

        // Cập nhật assignment và order
        DeliveryAssignment assignment = confirmation.getDeliveryAssignment();
        assignment.setStatus(DeliveryStatus.CONFIRMED);
        deliveryAssignmentRepository.save(assignment);

        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Cập nhật thống kê shipper
        Shipper shipper = assignment.getShipper();
        shipper.setTotalDeliveries(shipper.getTotalDeliveries() + 1);
        shipper.setSuccessfulDeliveries(shipper.getSuccessfulDeliveries() + 1);
        shipperRepository.save(shipper);

        // Gửi thông báo cho shipper
        notificationService.sendNotification(
                shipper.getUser(),
                NotificationType.ORDER_UPDATE,
                "Giao hàng hoàn thành",
                "Khách hàng đã xác nhận nhận đơn hàng #" + order.getId(),
                order.getId(),
                Notification.Priority.MEDIUM,
                Notification.Category.ORDER,
                "🎉"
        );

        log.info("Customer confirmed delivery for order {}", orderId);
    }

    @Transactional
    public void cancelDelivery(User shipperUser, Long assignmentId, CancelDeliveryRequest request) {
        DeliveryAssignment assignment = validateShipperAssignment(shipperUser, assignmentId);

        if (assignment.getStatus() == DeliveryStatus.DELIVERED ||
                assignment.getStatus() == DeliveryStatus.CONFIRMED) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng đã giao");
        }

        assignment.setStatus(DeliveryStatus.CANCELLED);
        assignment.setCancelledAt(LocalDateTime.now());
        assignment.setCancellationReason(request.getCancellationReason());
        assignment.setShipper(null); // Giải phóng shipper
        deliveryAssignmentRepository.save(assignment);

        // Cập nhật trạng thái order về PROCESSING để shipper khác có thể nhận
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);

        // Tạo assignment mới để các shipper khác có thể nhận
        DeliveryAssignment newAssignment = DeliveryAssignment.builder()
                .order(order)
                .status(DeliveryStatus.AVAILABLE)
                .estimatedDelivery(calculateEstimatedDelivery(order))
                .build();
        deliveryAssignmentRepository.save(newAssignment);

        // Gửi thông báo cho customer
        notificationService.sendNotification(
                order.getCustomer(),
                NotificationType.ORDER_UPDATE,
                "Đơn hàng bị hủy giao",
                "Đơn hàng #" + order.getId() + " bị hủy giao do: " + request.getCancellationReason() + ". Hệ thống đang tìm shipper mới.",
                order.getId(),
                Notification.Priority.HIGH,
                Notification.Category.ORDER,
                "⚠️"
        );

        log.info("Shipper cancelled delivery for order {}, reason: {}", order.getId(), request.getCancellationReason());
    }

    public Page<DeliveryAssignmentDTO> getMyDeliveries(User shipperUser, Pageable pageable) {
        Shipper shipper = shipperRepository.findByUserId(shipperUser.getId())
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin shipper"));

        Page<DeliveryAssignment> assignments = deliveryAssignmentRepository
                .findByShipperIdOrderByCreatedAtDesc(shipper.getId(), pageable);

        return assignments.map(this::mapToDeliveryAssignmentDTO);
    }

    public DeliveryTrackingDTO getDeliveryTracking(Long orderId) {
        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin giao hàng"));

        DeliveryTrackingDTO tracking = new DeliveryTrackingDTO();
        tracking.setOrderId(orderId);
        tracking.setCurrentStatus(assignment.getStatus());
        tracking.setEstimatedDelivery(assignment.getEstimatedDelivery());
        tracking.setActualDelivery(assignment.getActualDelivery());

        if (assignment.getShipper() != null) {
            tracking.setShipperName(assignment.getShipper().getUser().getFullName());
            tracking.setShipperPhone(assignment.getShipper().getUser().getPhone());
        }

        // Tạo timeline
        List<DeliveryTimelineDTO> timeline = createDeliveryTimeline(assignment);
        tracking.setTimeline(timeline);

        return tracking;
    }

    // Helper methods
    private DeliveryAssignment validateShipperAssignment(User shipperUser, Long assignmentId) {
        Shipper shipper = shipperRepository.findByUserId(shipperUser.getId())
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin shipper"));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn giao hàng"));

        if (!assignment.getShipper().getId().equals(shipper.getId())) {
            throw new ExCustom(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác với đơn hàng này");
        }

        return assignment;
    }

    private LocalDateTime calculateEstimatedDelivery(Order order) {
        OrderShipping orderShipping = orderShippingRepository.findByOrder(order);
        if (orderShipping == null) {
            return LocalDateTime.now().plusDays(2); // Default 2 days
        }

        // Kiểm tra cùng tỉnh thành
        String pickupProvince = orderShipping.getPickupProvince();
        String deliveryProvince = orderShipping.getDeliveryProvince();

        if (pickupProvince.equals(deliveryProvince)) {
            return LocalDateTime.now().plusHours(6); // 6 hours for same province
        } else {
            return LocalDateTime.now().plusDays(2); // 2 days for different provinces
        }
    }

    private String generateConfirmationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }


    private AvailableOrderDTO mapToAvailableOrderDTO(DeliveryAssignment assignment) {
        Order order = assignment.getOrder();
        OrderShipping shipping = orderShippingRepository.findByOrder(order);

        AvailableOrderDTO dto = new AvailableOrderDTO();
        dto.setOrderId(order.getId());
        dto.setStoreName(order.getStore().getName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setEstimatedPickupTime(LocalDateTime.now().plusHours(1));
        dto.setEstimatedDeliveryTime(assignment.getEstimatedDelivery());
        dto.setCreatedAt(order.getCreatedAt());

        // ✅ Tính tiền thu hộ
        dto.setCollectAmount(calculateCollectAmount(order));

        if (shipping != null) {
            dto.setPickupAddress(shipping.getPickupAddress());
            dto.setPickupProvince(shipping.getPickupProvince());
            dto.setPickupDistrict(shipping.getPickupDistrict());
            dto.setPickupWard(shipping.getPickupWard());
            dto.setDeliveryAddress(shipping.getDeliveryAddress());
            dto.setDeliveryProvince(shipping.getDeliveryProvince());
            dto.setDeliveryDistrict(shipping.getDeliveryDistrict());
            dto.setDeliveryWard(shipping.getDeliveryWard());
            dto.setShippingCost(shipping.getShippingCost());

            // Calculate approximate distance (simplified calculation)
            dto.setDistanceKm(calculateDistance(shipping));
        }

        return dto;
    }

    private DeliveryAssignmentDTO mapToDeliveryAssignmentDTO(DeliveryAssignment assignment) {
        Order order = assignment.getOrder();
        OrderShipping shipping = orderShippingRepository.findByOrder(order);

        DeliveryAssignmentDTO dto = new DeliveryAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setOrderId(order.getId());
        dto.setStoreName(order.getStore().getName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(assignment.getStatus());
        dto.setAssignedAt(assignment.getAssignedAt());
        dto.setEstimatedDelivery(assignment.getEstimatedDelivery());
        dto.setDeliveryNotes(assignment.getDeliveryNotes());
        dto.setCreatedAt(assignment.getCreatedAt());

        // ✅ Tính tiền thu hộ
        dto.setCollectAmount(calculateCollectAmount(order));

        if (shipping != null) {
            dto.setCustomerName(shipping.getDeliveryName());
            dto.setCustomerPhone(shipping.getDeliveryPhone());
            dto.setPickupAddress(shipping.getPickupAddress() + ", " + shipping.getPickupWard() +
                    ", " + shipping.getPickupDistrict() + ", " + shipping.getPickupProvince());
            dto.setDeliveryAddress(shipping.getDeliveryAddress() + ", " + shipping.getDeliveryWard() +
                    ", " + shipping.getDeliveryDistrict() + ", " + shipping.getDeliveryProvince());
        }

        return dto;
    }

    /**
     * Tính số tiền cần thu hộ dựa trên phương thức thanh toán
     */
    private BigDecimal calculateCollectAmount(Order order) {
        // Nếu thanh toán khi nhận hàng (COD) thì thu hộ toàn bộ
        if (order.getPaymentMethod() == PaymentMethod.COD) {
            return order.getTotalAmount();
        }
        // Nếu đã thanh toán online hoặc ví thì không cần thu hộ
        else if (order.getPaymentMethod() == PaymentMethod.ONLINE ||
                order.getPaymentMethod() == PaymentMethod.WALLET) {
            return BigDecimal.ZERO;
        }
        // Mặc định không thu hộ
        return BigDecimal.ZERO;
    }

    private List<DeliveryTimelineDTO> createDeliveryTimeline(DeliveryAssignment assignment) {
        List<DeliveryTimelineDTO> timeline = new ArrayList<>();

        // Order created
        DeliveryTimelineDTO created = new DeliveryTimelineDTO();
        created.setStatus(DeliveryStatus.AVAILABLE);
        created.setDescription("Đơn hàng được tạo và chờ shipper nhận");
        created.setTimestamp(assignment.getCreatedAt());
        timeline.add(created);

        // Assigned
        if (assignment.getAssignedAt() != null) {
            DeliveryTimelineDTO assigned = new DeliveryTimelineDTO();
            assigned.setStatus(DeliveryStatus.ASSIGNED);
            assigned.setDescription("Shipper đã nhận đơn hàng");
            assigned.setTimestamp(assignment.getAssignedAt());
            timeline.add(assigned);
        }

        // Picked up
        if (assignment.getPickedUpAt() != null) {
            DeliveryTimelineDTO pickedUp = new DeliveryTimelineDTO();
            pickedUp.setStatus(DeliveryStatus.PICKED_UP);
            pickedUp.setDescription("Shipper đã lấy hàng");
            pickedUp.setTimestamp(assignment.getPickedUpAt());
            timeline.add(pickedUp);
        }

        // In transit
        if (assignment.getStatus() == DeliveryStatus.IN_TRANSIT) {
            DeliveryTimelineDTO inTransit = new DeliveryTimelineDTO();
            inTransit.setStatus(DeliveryStatus.IN_TRANSIT);
            inTransit.setDescription("Đang vận chuyển");
            inTransit.setTimestamp(LocalDateTime.now());
            timeline.add(inTransit);
        }

        // Delivered
        if (assignment.getDeliveredAt() != null) {
            DeliveryTimelineDTO delivered = new DeliveryTimelineDTO();
            delivered.setStatus(DeliveryStatus.DELIVERED);
            delivered.setDescription("Đã giao hàng, chờ xác nhận");
            delivered.setTimestamp(assignment.getDeliveredAt());
            timeline.add(delivered);
        }

        // Confirmed
        if (assignment.getStatus() == DeliveryStatus.CONFIRMED) {
            DeliveryTimelineDTO confirmed = new DeliveryTimelineDTO();
            confirmed.setStatus(DeliveryStatus.CONFIRMED);
            confirmed.setDescription("Khách hàng đã xác nhận nhận hàng");
            confirmed.setTimestamp(assignment.getActualDelivery());
            timeline.add(confirmed);
        }

        // Cancelled
        if (assignment.getCancelledAt() != null) {
            DeliveryTimelineDTO cancelled = new DeliveryTimelineDTO();
            cancelled.setStatus(DeliveryStatus.CANCELLED);
            cancelled.setDescription("Đã hủy: " + assignment.getCancellationReason());
            cancelled.setTimestamp(assignment.getCancelledAt());
            timeline.add(cancelled);
        }

        return timeline;
    }

    private Double calculateDistance(OrderShipping shipping) {
        // Simplified distance calculation
        // In production, you would use Google Maps API or similar service
        if (shipping.getPickupProvince().equals(shipping.getDeliveryProvince())) {
            return 15.0; // Same province: ~15km average
        } else {
            return 250.0; // Different provinces: ~250km average
        }
    }
}