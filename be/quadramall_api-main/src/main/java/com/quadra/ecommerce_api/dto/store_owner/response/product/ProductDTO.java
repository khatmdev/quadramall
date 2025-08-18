package com.quadra.ecommerce_api.dto.store_owner.response.product;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Schema(description = "Hiển thị tại danh sách sản phẩm")
@Data
public class ProductDTO {
    @Schema(description = "ID sản phẩm", example = "101")
    private Long id;

    @Schema(description = "Tên sản phẩm", example = "Áo thun nam basic")
    private String name;

    @Schema(description = "slug sản phẩm", example = "ao-thun-nam-basic-1")
    private String slug;

    @Schema(description = "URL ảnh đại diện sản phẩm", example = "https://example.com/images/product101.jpg")
    private String image;

    @Schema(description = "Tổng số lượng tồn kho của sản phẩm", example = "150")
    private Integer totalStock;

    @Schema(description = "Loại sản phẩm (ví dụ: 'Áo', 'Giày')", example = "Áo")
    private String itemType;

    @Schema(description = "Giá thấp nhất trong các biến thể (nếu có)", example = "99000")
    private BigDecimal minPrice;

    @Schema(description = "Giá cao nhất trong các biến thể (nếu có)", example = "149000")
    private BigDecimal maxPrice;

    @Schema(description = "Trạng thái hiển thị của sản phẩm (true: đang bán, false: ngừng bán)", example = "true")
    private Boolean status;
}
