package com.quadra.ecommerce_api.controller.buyer;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.admin.response.SellerRegistrationResponseDto;
import com.quadra.ecommerce_api.dto.buyer.request.SellerRegistrationRequestDto;
import com.quadra.ecommerce_api.dto.buyer.request.RegistrationUpdateRequestDto;
import com.quadra.ecommerce_api.dto.buyer.response.RegistrationDetailsDto;
import com.quadra.ecommerce_api.service.buyer.SellerRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Seller Registration", description = "API for seller registration operations")
@RestController
@RequestMapping("/seller-registrations")
public class SellerRegistrationController extends AbstractBuyerController {

    private final SellerRegistrationService sellerRegistrationService;

    @Autowired
    public SellerRegistrationController(SellerRegistrationService sellerRegistrationService) {
        this.sellerRegistrationService = sellerRegistrationService;
    }

    @Operation(summary = "Register a new store", description = "Allows a buyer to submit a store registration request")
    @PostMapping
    public ResponseEntity<ApiResponse<SellerRegistrationResponseDto>> registerStore(
            @Valid @RequestBody SellerRegistrationRequestDto requestDto) {
        System.out.println("Dữ liệu nhận được: " + requestDto);
        SellerRegistrationResponseDto responseDto = sellerRegistrationService.registerStore(requestDto);
        return created(responseDto);
    }

    @Operation(summary = "Get current user registration status", description = "Get current user's registration status and details")
    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<RegistrationDetailsDto>> getCurrentUserRegistration() {
        RegistrationDetailsDto detailsDto = sellerRegistrationService.getCurrentUserRegistration();

        if (detailsDto == null) {
            return ok(null, "Người dùng chưa có đăng ký cửa hàng nào");
        }

        return ok(detailsDto);
    }

    @Operation(summary = "Get registration details", description = "Get detailed registration information for editing when status is REJECTED")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationDetailsDto>> getRegistrationDetails(
            @PathVariable Long id) {
        RegistrationDetailsDto detailsDto = sellerRegistrationService.getRegistrationDetails(id);
        return ok(detailsDto);
    }

    @Operation(summary = "Update registration", description = "Update registration information when status is REJECTED")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SellerRegistrationResponseDto>> updateRegistration(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationUpdateRequestDto updateDto) {
        SellerRegistrationResponseDto responseDto = sellerRegistrationService.updateRegistration(id, updateDto);
        return ok(responseDto);
    }

    @Operation(summary = "Cancel registration", description = "Cancel a pending or rejected registration")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(
            @PathVariable Long id) {
        sellerRegistrationService.cancelRegistration(id);
        return ok(null, "Đăng ký đã được hủy thành công");
    }
}