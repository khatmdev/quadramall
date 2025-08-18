package com.quadra.ecommerce_api.dto.buyer.response;

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

    @Schema(description = "Mô tả danh mục", example = "Danh mục sản phẩm điện thoại thông minh")
    private String description;

    @Schema(description = "ID của danh mục cha", example = "null")
    private Long parentId;

    @Schema(description = "Danh sách danh mục con (phân cấp)")
    private List<CategoryDto> children;

    // Constructor 5 tham số (bỏ children, set mặc định empty list)
    public CategoryDto(Long id, String name, String slug, String description, Long parentId) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.parentId = parentId;
        this.children = new ArrayList<>();
    }
}