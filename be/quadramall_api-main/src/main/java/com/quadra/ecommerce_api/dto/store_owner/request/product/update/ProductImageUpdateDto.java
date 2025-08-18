package com.quadra.ecommerce_api.dto.store_owner.request.product.update;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Dữ liệu để cập nhật hình ảnh sản phẩm")
@Data
public class ProductImageUpdateDto {
    @Schema(description = "ID hình ảnh (nếu cập nhật, để null nếu tạo mới)", example = "801")
    private Long id;

    @Schema(description = "URL hình ảnh", example = "https://example.com/images/image801.jpg")
    private String imageUrl;
}
