package com.quadra.ecommerce_api.dto.store_owner.response.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "DTO chứa thông tin chi tiết danh mục sản phẩm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDetailDto {
    @Schema(description = "ID của danh mục", example = "1")
    private Long id;

    @Schema(description = "Tên danh mục", example = "Điện thoại")
    private String name;

    @Schema(description = "Tổng số sản phẩm hoạt động có danh mục", example = "80")
    private Long totalProductsWithCategory;

    @Schema(description = "Danh sách sản phẩm thuộc danh mục")
    private List<ProductDto> products;

    @Schema(description = "Danh sách sản phẩm chưa phân loại")
    private List<ProductDto> uncategorizedProducts;
}