package com.quadra.ecommerce_api.dto.store_owner.request.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO cho yêu cầu tạo danh mục sản phẩm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequestDto {
    @Schema(description = "Tên danh mục", example = "Điện thoại", required = true)
    private String name;

    @Schema(description = "Slug của danh mục", example = "dien-thoai", required = true)
    private String slug;

    @Schema(description = "Mô tả danh mục", example = "Danh mục chứa các sản phẩm điện thoại thông minh")
    private String description;

    @Schema(description = "ID của danh mục cha", example = "1")
    private Long parentId;

    @Schema(description = "ID của cửa hàng", example = "1", required = true)
    private Long storeId;
}