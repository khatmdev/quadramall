package com.quadra.ecommerce_api.dto.store_owner.response.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "DTO chứa thông tin danh mục sản phẩm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    @Schema(description = "ID của danh mục", example = "1")
    private Long id;

    @Schema(description = "Tên danh mục", example = "Điện thoại")
    private String name;

    @Schema(description = "Slug của danh mục", example = "dien-thoai")
    private String slug;

    @Schema(description = "Mô tả danh mục", example = "Danh mục chứa các sản phẩm điện thoại thông minh")
    private String description;

    @Schema(description = "ID của danh mục cha", example = "null")
    private Long parentId;

    @Schema(description = "Danh sách danh mục con (phân cấp)")
    private List<CategoryDto> children;

    @Schema(description = "Tổng số danh mục trong cửa hàng", example = "10")
    private Long totalCategories;

    @Schema(description = "Tổng số sản phẩm hoạt động trong cửa hàng", example = "100")
    private Long totalProducts;

    @Schema(description = "Tổng số sản phẩm hoạt động có danh mục", example = "80")
    private Long totalProductsWithCategory;

    public CategoryDto(Long id, String name, String slug, String description, Long parentId) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.parentId = parentId;
        this.children = new ArrayList<>();
        this.totalCategories = 0L;
        this.totalProducts = 0L;
        this.totalProductsWithCategory = 0L;
    }
}