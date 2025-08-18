package com.quadra.ecommerce_api.controller.customer.store;

import com.quadra.ecommerce_api.common.base.AbstractPublicController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.buyer.request.StoreFavoriteRequestDto;
import com.quadra.ecommerce_api.dto.buyer.response.ProductDto;
import com.quadra.ecommerce_api.dto.buyer.response.ShopDetailDto;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.service.customer.store.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Store", description = "API liên quan đến thông tin chi tiết cửa hàng")
@RestController
@RequestMapping("/public/stores")
public class StoreController extends AbstractPublicController {

    private final StoreService storeService;

    @Autowired
    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @Operation(
            summary = "Lấy thông tin chi tiết cửa hàng theo slug",
            description = "Trả về thông tin chi tiết của cửa hàng dựa trên slug, bao gồm danh mục, sản phẩm, mã giảm giá và các thông tin thống kê như số sản phẩm, số người theo dõi, đánh giá, và tỉ lệ phản hồi chat."
    )
    @GetMapping("/{storeSlug}")
    public ResponseEntity<ApiResponse<ShopDetailDto>> getStoreBySlug(
            @Parameter(description = "Slug của cửa hàng", required = true, example = "quadra-store")
            @PathVariable String storeSlug,
            @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : null;
        ShopDetailDto shopDetailDto = storeService.findStoreBySlug(storeSlug, userId);
        return ok(shopDetailDto);
    }

    @GetMapping("/{storeSlug}/products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getStoreProducts(
            @Parameter(description = "Slug của cửa hàng", required = true, example = "quadra-store")
            @PathVariable String storeSlug,
            @Parameter(description = "ID danh mục (bao gồm danh mục con)", example = "1")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Tiêu chí sắp xếp: comprehensive, best_selling, newest, price_asc, price_desc", example = "best_selling")
            @RequestParam(defaultValue = "comprehensive") String sort,
            @Parameter(description = "Trang hiện tại", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số sản phẩm mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDto> products = storeService.findStoreProducts(storeSlug, categoryId, sort, userId, pageable);
        return ok(products);
    }

    @Operation(
            summary = "Thêm cửa hàng vào danh sách yêu thích",
            description = "Thêm cửa hàng vào danh sách yêu thích của người dùng."
    )
    @PostMapping("/favorite")
    public ResponseEntity<ApiResponse<Void>> addStoreFavorite(
            @Parameter(description = "Thông tin cửa hàng cần thêm vào yêu thích", required = true)
            @RequestBody StoreFavoriteRequestDto favoriteDto,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            throw new ResourceNotFound("Yêu cầu đăng nhập để thực hiện hành động này");
        }
        favoriteDto.setUserId(user.getId());
        storeService.addStoreFavorite(favoriteDto);
        return created(null, "Đã thêm cửa hàng vào danh sách yêu thích");
    }

    @Operation(
            summary = "Xóa cửa hàng khỏi danh sách yêu thích",
            description = "Xóa cửa hàng khỏi danh sách yêu thích của người dùng."
    )
    @DeleteMapping("/favorite/{storeId}")
    public ResponseEntity<ApiResponse<Void>> removeStoreFavorite(
            @Parameter(description = "ID của cửa hàng cần xóa khỏi yêu thích", required = true, example = "1")
            @PathVariable Long storeId,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            throw new ResourceNotFound("Yêu cầu đăng nhập để thực hiện hành động này");
        }
        storeService.removeStoreFavorite(user.getId(), storeId);
        return deleted("Đã xóa cửa hàng khỏi danh sách yêu thích");
    }
}