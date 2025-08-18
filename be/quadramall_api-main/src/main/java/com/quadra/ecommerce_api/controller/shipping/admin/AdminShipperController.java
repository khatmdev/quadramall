package com.quadra.ecommerce_api.controller.shipping.admin;

import com.quadra.ecommerce_api.dto.custom.shipping.request.ApproveShipperRequest;
import com.quadra.ecommerce_api.dto.custom.shipping.request.RejectShipperRequest;
import com.quadra.ecommerce_api.dto.custom.shipping.response.ShipperRegistrationResponse;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.shiping.ShipperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/shipper")
@RequiredArgsConstructor
public class AdminShipperController {

    private final ShipperService shipperService;

    /**
     * Xem danh sách đăng ký shipper chờ duyệt
     */
    @GetMapping("/registrations/pending")
    public ResponseEntity<Page<ShipperRegistrationResponse>> getPendingRegistrations(Pageable pageable) {
        Page<ShipperRegistrationResponse> registrations = shipperService.getPendingRegistrations(pageable);
        return ResponseEntity.ok(registrations);
    }

    /**
     * Duyệt đăng ký shipper
     */
    @PostMapping("/approve/{registrationId}")
    public ResponseEntity<?> approveShipper(
            @AuthenticationPrincipal User admin,
            @PathVariable Long registrationId,
            @RequestBody(required = false) ApproveShipperRequest request) {

        shipperService.approveShipper(registrationId, admin, request);
        return ResponseEntity.ok().body("Đã duyệt đăng ký shipper thành công");
    }

    /**
     * Từ chối đăng ký shipper
     */
    @PostMapping("/reject/{registrationId}")
    public ResponseEntity<?> rejectShipper(
            @PathVariable Long registrationId,
            @Valid @RequestBody RejectShipperRequest request) {

        shipperService.rejectShipper(registrationId, request);
        return ResponseEntity.ok().body("Đã từ chối đăng ký shipper");
    }
}