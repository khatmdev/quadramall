package com.quadra.ecommerce_api.controller.admin;


import com.quadra.ecommerce_api.common.base.AbstractAdminController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.admin.response.AdminSellerRegistrationResponseDto;
import com.quadra.ecommerce_api.service.admin.response.AdminSellerRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin.SellerRegistration", description = "API cho quản trị viên quản lý yêu cầu đăng ký của người bán")
@RestController
@RequestMapping("/admin/seller-registrations")
@RequiredArgsConstructor
@Validated
public class AdminSellerRegistrationController extends AbstractAdminController {


    private final AdminSellerRegistrationService adminSellerRegistrationService;


    @Operation(summary = "Lấy danh sách yêu cầu đăng ký cửa hàng", description = "Lấy danh sách tất cả yêu cầu đăng ký cửa hàng, có thể lọc theo trạng thái")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminSellerRegistrationResponseDto>>> getAllRegistrations(
            @Parameter(description = "Lọc theo trạng thái (PENDING, APPROVED, REJECTED)", example = "PENDING", required = false)
            @RequestParam(required = false) String status) {
        List<AdminSellerRegistrationResponseDto> registrations = adminSellerRegistrationService.getAllRegistrations(status);
        return ok(registrations);
    }

    @Operation(summary = "Duyệt yêu cầu đăng ký cửa hàng", description = "Chuyển trạng thái yêu cầu sang APPROVED và tạo cửa hàng mới")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminSellerRegistrationResponseDto>> approveRegistration(
            @Parameter(description = "ID của yêu cầu đăng ký cần duyệt", example = "1")
            @PathVariable Long id) {
        System.out.println("Id cửa hàng đăng ký: "+ id);
        AdminSellerRegistrationResponseDto updated = adminSellerRegistrationService.approveRegistration(id);
        return updated(updated);
    }

    @Operation(summary = "Từ chối yêu cầu đăng ký cửa hàng", description = "Chuyển trạng thái yêu cầu sang REJECTED và ghi lý do từ chối")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminSellerRegistrationResponseDto>> rejectRegistration(
            @Parameter(description = "ID của yêu cầu đăng ký cần từ chối", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody RejectSellerRegistrationRequestDto requestDto) {
        AdminSellerRegistrationResponseDto updated = adminSellerRegistrationService.rejectRegistration(id, requestDto);
        return updated(updated);
    }
}
