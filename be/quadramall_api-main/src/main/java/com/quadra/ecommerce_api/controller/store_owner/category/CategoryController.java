package com.quadra.ecommerce_api.controller.store_owner.category;

import com.quadra.ecommerce_api.common.base.AbstractSellerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.store_owner.request.category.CreateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.request.category.UpdateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDetailDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDto;
import com.quadra.ecommerce_api.service.store_owner.request.category.CategoryCommandService;
import com.quadra.ecommerce_api.service.store_owner.response.category.CategoryQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Category", description = "API liên quan đến quản lý danh mục sản phẩm của cửa hàng")
@RestController
@RequestMapping("/seller/stores")
public class CategoryController extends AbstractSellerController {

    private final CategoryQueryService categoryQueryService;
    private final CategoryCommandService categoryCommandService;

    @Autowired
    public CategoryController(CategoryQueryService categoryQueryService, CategoryCommandService categoryCommandService) {
        this.categoryQueryService = categoryQueryService;
        this.categoryCommandService = categoryCommandService;
    }

    @Operation(
            summary = "Lấy danh sách danh mục theo cửa hàng",
            description = "Trả về danh sách danh mục sản phẩm dạng cây (bao gồm danh mục con) của cửa hàng dựa trên ID cửa hàng."
    )
    @GetMapping("/{storeId}/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getStoreCategories(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId
    ) {
        List<CategoryDto> categories = categoryQueryService.getCategoryTreeByStoreId(storeId);
        return ok(categories);
    }

    @Operation(
            summary = "Lấy chi tiết danh mục",
            description = "Trả về thông tin chi tiết của danh mục, bao gồm danh sách sản phẩm thuộc danh mục và sản phẩm chưa phân loại."
    )
    @GetMapping("/{storeId}/categories/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDetailDto>> getCategoryDetail(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "ID của danh mục", required = true, example = "2")
            @PathVariable Long categoryId
    ) {
        CategoryDetailDto categoryDetail = categoryQueryService.getCategoryDetail(storeId, categoryId);
        return ok(categoryDetail);
    }

    @Operation(
            summary = "Tạo danh mục mới",
            description = "Tạo một danh mục sản phẩm mới cho cửa hàng dựa trên ID cửa hàng."
    )
    @PostMapping("/{storeId}/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "Thông tin danh mục cần tạo")
            @Valid @RequestBody CreateCategoryRequestDto requestDto
    ) {
        if (!storeId.equals(requestDto.getStoreId())) {
            throw new IllegalArgumentException("ID cửa hàng trong đường dẫn không khớp với ID trong request body");
        }
        CategoryDto category = categoryCommandService.createCategory(requestDto);
        return ok(category);
    }

    @Operation(
            summary = "Cập nhật danh mục",
            description = "Cập nhật thông tin của danh mục sản phẩm dựa trên ID danh mục."
    )
    @PutMapping("/{storeId}/categories/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "ID của danh mục", required = true, example = "2")
            @PathVariable Long categoryId,
            @Parameter(description = "Thông tin danh mục cần cập nhật")
            @Valid @RequestBody UpdateCategoryRequestDto requestDto
    ) {
        CategoryDto category = categoryCommandService.updateCategory(categoryId, requestDto);
        return ok(category);
    }

    @Operation(
            summary = "Xóa danh mục",
            description = "Xóa một danh mục sản phẩm dựa trên ID danh mục, chỉ khi danh mục không có danh mục con."
    )
    @DeleteMapping("/{storeId}/categories/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "ID của danh mục", required = true, example = "2")
            @PathVariable Long categoryId
    ) {
        categoryCommandService.deleteCategory(categoryId);
        return ok(null);
    }

    @Operation(
            summary = "Thêm sản phẩm vào danh mục",
            description = "Liên kết một sản phẩm với danh mục dựa trên ID cửa hàng, danh mục và sản phẩm."
    )
    @PostMapping("/{storeId}/categories/{categoryId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> addProductToCategory(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "ID của danh mục", required = true, example = "2")
            @PathVariable Long categoryId,
            @Parameter(description = "ID của sản phẩm", required = true, example = "1")
            @PathVariable Long productId
    ) {
        categoryCommandService.addProductToCategory(storeId, categoryId, productId);
        return ok(null);
    }

    @Operation(
            summary = "Xóa sản phẩm khỏi danh mục",
            description = "Gỡ liên kết một sản phẩm khỏi danh mục dựa trên ID cửa hàng, danh mục và sản phẩm."
    )
    @DeleteMapping("/{storeId}/categories/{categoryId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeProductFromCategory(
            @Parameter(description = "ID của cửa hàng", required = true, example = "1")
            @PathVariable Long storeId,
            @Parameter(description = "ID của danh mục", required = true, example = "2")
            @PathVariable Long categoryId,
            @Parameter(description = "ID của sản phẩm", required = true, example = "1")
            @PathVariable Long productId
    ) {
        categoryCommandService.removeProductFromCategory(storeId, categoryId, productId);
        return ok(null);
    }
}