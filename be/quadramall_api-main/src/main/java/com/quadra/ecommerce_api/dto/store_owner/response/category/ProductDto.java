package com.quadra.ecommerce_api.dto.store_owner.response.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO chứa thông tin sản phẩm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    @Schema(description = "ID của sản phẩm", example = "1")
    private Long id;

    @Schema(description = "Tên sản phẩm", example = "iPhone 14")
    private String name;

    @Schema(description = "Giá sản phẩm", example = "20000000")
    private Long price;

    @Schema(description = "URL hình ảnh sản phẩm", example = "https://example.com/iphone.jpg")
    private String image;

    @Schema(description = "ID danh mục của sản phẩm", example = "1")
    private Long categoryId;
}