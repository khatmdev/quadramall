package com.quadra.ecommerce_api.controller.shipping.customer;

import com.quadra.ecommerce_api.dto.custom.shipping.response.DeliveryTrackingDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.shiping.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/delivery")
@RequiredArgsConstructor
public class CustomerDeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Theo dõi trạng thái giao hàng
     */
    @GetMapping("/tracking/{orderId}")
    public ResponseEntity<DeliveryTrackingDTO> getDeliveryTracking(@PathVariable Long orderId) {
        DeliveryTrackingDTO tracking = deliveryService.getDeliveryTracking(orderId);
        return ResponseEntity.ok(tracking);
    }

    /**
     * Xác nhận đã nhận hàng
     */
    @PostMapping("/confirm/{orderId}")
    public ResponseEntity<?> confirmDelivery(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestParam String confirmationCode) {

        deliveryService.confirmDeliveryByCustomer(user, orderId, confirmationCode);
        return ResponseEntity.ok().body("Đã xác nhận nhận hàng thành công");
    }
}
