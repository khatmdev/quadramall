// DiscountCodeController.java
package com.quadra.ecommerce_api.controller.discount;


import com.quadra.ecommerce_api.common.annotation.ApiVoid;
import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.discount.request.ApplyDiscountRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.CreateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.UpdateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCalculationResponse;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCodeListResponse;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.discount.DiscountCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/buyer/discount-codes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Discount Code ", description = "APIs mã giảm giá")
public class DiscountCodeController extends AbstractBuyerController {

    private final DiscountCodeService discountCodeService;


    @GetMapping("/{discountCodeId}")
    @Operation(summary = "Lấy thông tin chi tiết mã giảm giá")
    public ResponseEntity<ApiResponse<DiscountCodeDTO>> getDiscountCodeById(
            @PathVariable Long discountCodeId) {

        DiscountCodeDTO discountCodeDTO = discountCodeService.getDiscountCodeById(discountCodeId);

        return ok(discountCodeDTO);
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Lấy danh sách mã giảm giá theo cửa hàng")
    public ResponseEntity<ApiResponse<DiscountCodeListResponse>> getDiscountCodesByStore(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        // ✅ Validate input parameters
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10; // Limit max size

        Sort sort = sortDirection.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        DiscountCodeListResponse response = discountCodeService.getDiscountCodesByStore(storeId, pageable);
        System.out.println("Discount: "+response);
        return ok(response);
    }



    // ===== BUSINESS OPERATIONS =====

    @PostMapping("/apply")
    @Operation(summary = "Áp dụng mã giảm giá cho đơn hàng")
    public ResponseEntity<ApiResponse<DiscountCalculationResponse>> applyDiscountCode(
            @Valid @RequestBody ApplyDiscountRequest request) {

        log.info("=== CONTROLLER: Applying discount code ===");
        log.info("Request: {}", request);

        try {
            DiscountCalculationResponse response = discountCodeService.applyDiscountCode(request);

            log.info("Service response: {}", response);

            if (response.getSuccess()) {
                log.info("✅ Discount applied successfully");
                return ok(response,"Áp dụng mã giảm giá thành công");
            } else {
                log.error("❌ Failed to apply discount: {}", response.getMessage());
                return error (response.getMessage(), "error",HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            log.error("❌ Exception while applying discount code", e);
            return error (  "Lỗi hệ thống khi áp dụng mã giảm giá","error",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/store/{storeId}/applicable")
    @Operation(summary = "Lấy danh sách mã giảm giá có thể áp dụng")
    public ResponseEntity<ApiResponse<List<DiscountCodeDTO>>> getApplicableDiscountCodes(
            @PathVariable Long storeId,
            @RequestParam List<Long> productIds,
            @RequestParam Long userId) {

        List<DiscountCodeDTO> applicableDiscountCodes = discountCodeService
                .getApplicableDiscountCodes(storeId, productIds, userId);

        return ok(applicableDiscountCodes);
    }

    @GetMapping("/store/{storeId}/auto-best")
    @Operation(summary = "Tự động tìm mã giảm giá tốt nhất")
    public ResponseEntity<ApiResponse<DiscountCalculationResponse>> getAutoBestDiscount(
            @PathVariable Long storeId,
            @RequestParam List<Long> productIds,
            @RequestParam Long userId,
            @RequestParam BigDecimal orderAmount) {

        DiscountCalculationResponse response = discountCodeService
                .getAutoBestDiscount(storeId, productIds, userId, orderAmount);

        if (response.getSuccess()) {
            return ok(response);
        } else {
            return error(response.getMessage(), String.valueOf(HttpStatus.NOT_FOUND),404);
        }
    }

    @PostMapping("/confirm-usage")
    @Operation(summary = "Xác nhận sử dụng mã giảm giá")
    @ApiVoid
    public ResponseEntity<ApiResponse<Void>> confirmDiscountUsage(
            @RequestParam String discountCode,
            @RequestParam Long userId,
            @RequestParam Long orderId,
            @RequestParam BigDecimal discountAmount,
            @RequestParam BigDecimal originalAmount) {

        log.info("Confirming discount usage: {} for order: {}", discountCode, orderId);

        discountCodeService.confirmDiscountUsage(discountCode, userId, orderId, discountAmount, originalAmount);

        return updated();
    }

    // ===== VALIDATION ENDPOINTS =====

    @GetMapping("/validate")
    @Operation(summary = "Kiểm tra tính hợp lệ của mã giảm giá")
    public ResponseEntity<ApiResponse<Boolean>> validateDiscountCode(
            @RequestParam String discountCode,
            @RequestParam Long storeId,
            @RequestParam(required = false) List<Long> productIds,
            @RequestParam Long userId) {

        boolean isValid = discountCodeService.isDiscountCodeValid(discountCode, storeId, productIds, userId);

        String message = isValid ? "Mã giảm giá hợp lệ" : "Mã giảm giá không hợp lệ";
        return ok(isValid);
    }

    @GetMapping("/check-usability")
    @Operation(summary = "Kiểm tra khả năng sử dụng mã giảm giá")
    public ResponseEntity<ApiResponse<String>> checkDiscountCodeUsability(
            @RequestParam String discountCode,
            @RequestParam Long storeId,
            @RequestParam(required = false) List<Long> productIds,
            @RequestParam Long userId,
            @RequestParam BigDecimal orderAmount) {

        String errorMessage = discountCodeService.checkDiscountCodeUsability(
                discountCode, storeId, productIds, userId, orderAmount);

        if (errorMessage == null) {
            return ok("Mã giảm giá có thể sử dụng", null);
        } else {
            return error(errorMessage, String.valueOf(HttpStatus.BAD_REQUEST),400);
        }
    }
}
