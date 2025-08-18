package com.quadra.ecommerce_api.controller.admin;


import com.quadra.ecommerce_api.common.base.AbstractAdminController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.admin.request.LockStoreRequestDto;
import com.quadra.ecommerce_api.dto.admin.response.store.StoreManagementResponseDto;
import com.quadra.ecommerce_api.service.admin.response.AdminStoreManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Store Management", description = "API cho quản trị viên quản lý cửa hàng")
@RestController
@RequestMapping("/admin/stores")
@RequiredArgsConstructor
@Validated
public class AdminStoreManagementController extends AbstractAdminController {

    private final AdminStoreManagementService adminStoreManagementService;


    @Operation(summary = "Lấy danh sách dữ liệu quản lý cửa hàng",
            description = "Trả về danh sách thông tin cửa hàng, sản phẩm, và thống kê nghiệp vụ, có thể lọc theo trạng thái")
    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreManagementResponseDto>>> getStoreManagementData(
            @Parameter(description = "Lọc theo trạng thái (ACTIVE, INACTIVE, LOCKED)", example = "ACTIVE", required = false)
            @RequestParam(required = false) String status) {
        List<StoreManagementResponseDto> response = adminStoreManagementService.getStoreManagementData(status);
        return ok(response);
    }

    @Operation(summary = "Khóa hoặc mở khóa cửa hàng",
            description = "Cập nhật trạng thái cửa hàng (ACTIVE, INACTIVE, LOCKED) và lưu lý do khóa nếu có")
    @PatchMapping("/{storeId}/lock")
    public ResponseEntity<ApiResponse<Void>> lockUnlockStore(
            @Parameter(description = "ID của cửa hàng", example = "1")
            @PathVariable Long storeId,
            @RequestBody @Validated LockStoreRequestDto request) {
        adminStoreManagementService.lockUnlockStore(storeId, request);
        return ok(null, "Store status updated successfully");
    }
}
