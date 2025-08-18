package com.quadra.ecommerce_api.controller.discount;

import com.quadra.ecommerce_api.common.base.AbstractSellerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.discount.request.CreateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.UpdateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCodeListResponse;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
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

@RestController
@RequestMapping("/seller/discounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Discount Code Management", description = "APIs quản lý mã giảm giá")
public class DiscountSellerController extends AbstractSellerController {
    private final DiscountCodeService discountCodeService;
    private final StoreRepo storeRepo;

    // ===== CRUD OPERATIONS =====

    @PostMapping
    @Operation(summary = "Tạo mã giảm giá mới")
    public ResponseEntity<ApiResponse<DiscountCodeDTO>> createDiscountCode(
            @Valid @RequestBody CreateDiscountCodeRequest request,
            @AuthenticationPrincipal User user) {

        Long currentUserId = user.getId();
        log.info("User {} is creating discount code: {}", currentUserId, request.getCode());

        DiscountCodeDTO discountCodeDTO = discountCodeService.createDiscountCode(request, currentUserId);

        return created(discountCodeDTO);
    }

    @PutMapping("/{discountCodeId}")
    @Operation(summary = "Cập nhật mã giảm giá")
    public ResponseEntity<ApiResponse<DiscountCodeDTO>> updateDiscountCode(
            @PathVariable Long discountCodeId,
            @Valid @RequestBody UpdateDiscountCodeRequest request,
            @AuthenticationPrincipal User user) {

        Long currentUserId = user.getId();
        log.info("User {} is updating discount code: {}", currentUserId, discountCodeId);
        log.info("Discount startTime is: {} ",request.getStartDate());
        log.info("Discount endTime is: {} ",request.getEndDate());

        DiscountCodeDTO discountCodeDTO = discountCodeService.updateDiscountCode(
                discountCodeId, request, currentUserId);
        return updated(discountCodeDTO);
    }

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
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("User {} is getting discount codes by store: {}", user.getId(), storeId);

        if(!storeRepo.existsByIdAndOwnerId(storeId, user.getId())){
            return error("Không tìm thấy cửa hàng của bạn", String.valueOf(HttpStatus.NOT_FOUND),HttpStatus.NOT_FOUND);
        }

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

    @GetMapping("/store/{storeId}/search")
    @Operation(summary = "Tìm kiếm mã giảm giá")
    public ResponseEntity<ApiResponse<DiscountCodeListResponse>> searchDiscountCodes(
            @PathVariable Long storeId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        DiscountCodeListResponse response = discountCodeService.searchDiscountCodes(
                storeId, keyword, pageable);

        return ok(response);
    }

    @DeleteMapping("/{discountCodeId}")
    @Operation(summary = "Xóa mã giảm giá")
    public ResponseEntity<ApiResponse<Void>> deleteDiscountCode(
            @PathVariable Long discountCodeId,
            @AuthenticationPrincipal User user0){

        Long currentUserId = user0.getId();
        log.info("User {} is deleting discount code: {}", currentUserId, discountCodeId);

        discountCodeService.deleteDiscountCode(discountCodeId, currentUserId);

        return deleted();
    }

    @PatchMapping("/{discountCodeId}/toggle-status")
    @Operation(summary = "Kích hoạt/vô hiệu hóa mã giảm giá")
    public ResponseEntity<ApiResponse<Void>> toggleDiscountCodeStatus(
            @PathVariable Long discountCodeId,
            @RequestParam Boolean isActive,
            @AuthenticationPrincipal User user) {

        Long currentUserId = user.getId();
        log.info("User {} is toggling discount code {} status to: {}",
                currentUserId, discountCodeId, isActive);

        discountCodeService.toggleDiscountCodeStatus(discountCodeId, isActive, currentUserId);

        String message = isActive ? "Kích hoạt mã giảm giá thành công" : "Vô hiệu hóa mã giảm giá thành công";
        return updated(message);
    }
}
