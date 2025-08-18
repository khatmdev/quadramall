package com.quadra.ecommerce_api.controller.admin;

import com.quadra.ecommerce_api.common.annotation.ApiVoid;
import com.quadra.ecommerce_api.common.base.AbstractAdminController;
import com.quadra.ecommerce_api.common.base.AbstractPublicController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.base.cms.BannerDTO;
import com.quadra.ecommerce_api.dto.custom.cms.request.BannerSortDTO;
import com.quadra.ecommerce_api.service.cms.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin.Banner", description = "Quản lý banner hiển thị trên trang chủ")
@Validated
public class BannerController extends AbstractAdminController {

    private final BannerService bannerService;

    @Operation(summary = "Lấy danh sách tất cả banner")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerDTO>>> getAll() {
        List<BannerDTO> banners = bannerService.findAll();
        return ok(banners);
    }

    @Operation(summary = "Lấy chi tiết banner theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerDTO>> getById(
            @Parameter(description = "ID của banner cần lấy", example = "1")
            @PathVariable Long id
    ) {
        return ok(bannerService.findById(id));
    }

    @Operation(summary = "Tạo mới banner")
    @PostMapping
    public ResponseEntity<ApiResponse<BannerDTO>> create(@Valid @RequestBody BannerDTO dto) {
        BannerDTO created = bannerService.create(dto);
        return created(created);
    }

    @Operation(summary = "Cập nhật thông tin banner")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerDTO>> update(
            @Parameter(description = "ID của banner cần cập nhật", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody BannerDTO dto
    ) {
        BannerDTO updated = bannerService.update(id, dto);
        return updated(updated);
    }

    @Operation(summary = "Xoá banner khỏi hệ thống")
    @ApiVoid
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID của banner cần xoá", example = "1")
            @PathVariable Long id
    ) {
        bannerService.delete(id);
        return deleted();
    }

    @Operation(summary = "Bật/tắt trạng thái hiển thị của banner")
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<BannerDTO>> toggleActive(
            @Parameter(description = "ID của banner cần đổi trạng thái", example = "1")
            @PathVariable Long id
    ) {
        BannerDTO toggled = bannerService.toggleActive(id);
        return ok(toggled);
    }

    @Operation(summary = "Cập nhật thứ tự hiển thị các banner")
    @PutMapping("/reorder")
    @ApiVoid
    public ResponseEntity<ApiResponse<Void>> reorder(@Valid @RequestBody List<BannerSortDTO> orders) {
        bannerService.reorder(orders);
        return updated();
    }

    @Operation(summary = "Chọn banner làm intro duy nhất")
    @PatchMapping("/{id}/make-intro")
    public ResponseEntity<ApiResponse<BannerDTO>> makeIntro(
            @Parameter(description = "ID của banner sẽ là intro", example = "1")
            @PathVariable Long id
    ) {
        BannerDTO introBanner = bannerService.makeIntro(id);
        return ok(introBanner);
    }
}



