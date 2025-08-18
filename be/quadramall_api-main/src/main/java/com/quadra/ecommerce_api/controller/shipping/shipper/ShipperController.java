package com.quadra.ecommerce_api.controller.shipping.shipper;

import com.quadra.ecommerce_api.dto.custom.shipping.request.*;
import com.quadra.ecommerce_api.dto.custom.shipping.response.*;
import com.quadra.ecommerce_api.entity.user.User;

import com.quadra.ecommerce_api.service.shiping.DeliveryService;
import com.quadra.ecommerce_api.service.shiping.ShipperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipper")
@RequiredArgsConstructor
@Slf4j
public class ShipperController {

    private final ShipperService shipperService;
    private final DeliveryService deliveryService;

    /**
     * Đăng ký làm shipper
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerShipper(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ShipperRegistrationRequest request) {
        log.info("Registering shipper {}", user.getEmail());
        log.info("Shipper registration request {}", request);
        ShipperRegistrationResponse response = shipperService.registerShipper(user, request);
        log.info("Shipper registration response {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Đã đăng ký. chưa được phê duyệt
     */
    @GetMapping("/registration-status")
    public ResponseEntity<ShipperRegistrationStatusResponse> getStatatus(@AuthenticationPrincipal User user) {
        ShipperRegistrationStatusResponse stats = shipperService.getRegistrationStatus(user);
        return ResponseEntity.ok(stats);
    }
    /*
     * Đã đăng ký. được phê duyệt gòi
     */
    @GetMapping("/stats")
    public ResponseEntity<ShipperStatsDTO> getStats(@AuthenticationPrincipal User user) {
        ShipperStatsDTO stats = shipperService.getShipperStats(user);
        return ResponseEntity.ok(stats);
    }

    /**
     * Xem danh sách đơn hàng có thể nhận
     */
    @PreAuthorize("hasRole('SHIPPER')")
    @GetMapping("/available-orders")
    public ResponseEntity<Page<AvailableOrderDTO>> getAvailableOrders(
            @AuthenticationPrincipal User user,
            Pageable pageable) {

        Page<AvailableOrderDTO> orders = deliveryService.getAvailableOrders(user, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Nhận đơn hàng
     */
    @PostMapping("/accept-order/{orderId}")
    public ResponseEntity<?> acceptOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestBody(required = false) AcceptOrderRequest request) {

        deliveryService.acceptOrder(user, orderId, request);
        return ResponseEntity.ok().body("Đã nhận đơn hàng thành công");
    }

    /**
     * Xác nhận lấy hàng
     */
    @PostMapping("/pickup-order/{assignmentId}")
    public ResponseEntity<?> pickupOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long assignmentId) {

        deliveryService.pickupOrder(user, assignmentId);
        return ResponseEntity.ok().body("Đã xác nhận lấy hàng");
    }

    /**
     * Bắt đầu vận chuyển
     */
    @PostMapping("/start-delivery/{assignmentId}")
    public ResponseEntity<?> startDelivery(
            @AuthenticationPrincipal User user,
            @PathVariable Long assignmentId) {

        deliveryService.startDelivery(user, assignmentId);
        return ResponseEntity.ok().body("Đã bắt đầu vận chuyển");
    }

    /**
     * Hoàn thành giao hàng
     */
    @PostMapping("/complete-delivery/{assignmentId}")
    public ResponseEntity<?> completeDelivery(
            @AuthenticationPrincipal User user,
            @PathVariable Long assignmentId,
            @Valid @RequestBody CompleteDeliveryRequest request) {

        String confirmationCode = deliveryService.completeDelivery(user, assignmentId, request);
        return ResponseEntity.ok().body("Đã hoàn thành giao hàng. Mã xác nhận: " + confirmationCode);
    }

    /**
     * Hủy giao hàng
     */
    @PostMapping("/cancel-delivery/{assignmentId}")
    public ResponseEntity<?> cancelDelivery(
            @AuthenticationPrincipal User user,
            @PathVariable Long assignmentId,
            @Valid @RequestBody CancelDeliveryRequest request) {

        deliveryService.cancelDelivery(user, assignmentId, request);
        return ResponseEntity.ok().body("Đã hủy giao hàng");
    }

    /**
     * Xem danh sách đơn hàng của shipper
     */
    @GetMapping("/my-deliveries")
    public ResponseEntity<Page<DeliveryAssignmentDTO>> getMyDeliveries(
            @AuthenticationPrincipal User user,
            Pageable pageable) {

        Page<DeliveryAssignmentDTO> deliveries = deliveryService.getMyDeliveries(user, pageable);
        return ResponseEntity.ok(deliveries);
    }
}