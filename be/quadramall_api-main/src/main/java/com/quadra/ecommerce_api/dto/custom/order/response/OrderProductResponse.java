package com.quadra.ecommerce_api.dto.custom.order.response;

import com.quadra.ecommerce_api.dto.base.store.CategoryDTO;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin sản phẩm trong đơn hàng")
public class OrderProductResponse {
    @Schema(description = "Mã định danh duy nhất của sản phẩm", example = "456")
    private Long id;

    @Schema(description = "Loại mặt hàng của sản phẩm")
    private ItemTypeDTO itemType;

    @Schema(description = "Danh mục của sản phẩm")
    private CategoryDTO category;

    @Schema(description = "Tên của sản phẩm", example = "Áo thun nam")
    private String name;

    @Schema(description = "Slug của sản phẩm", example = "ao-thun-nam")
    private String slug;

    @Schema(description = "Mô tả của sản phẩm", example = "Áo thun nam chất liệu cotton")
    private String description;

    @Schema(description = "URL hình ảnh thumbnail của sản phẩm", example = "https://example.com/thumbnail.jpg")
    private String thumbnailUrl;

    @Schema(description = "Trạng thái hoạt động của sản phẩm", example = "true")
    private Boolean isActive;
}