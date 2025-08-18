package com.quadra.ecommerce_api.dto.admin.response.store;



import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Schema(description = "DTO chứa thông tin cơ bản và số lượng đã bán của sản phẩm thuộc cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    @Schema(description = "ID của sản phẩm", example = "1")
    private Long productId;

    @Schema(description = "Tên sản phẩm", example = "Product A")
    private String name;

    @Schema(description = "Giá nhỏ nhất của sản phẩm (từ các biến thể)", example = "99.99")
    private BigDecimal minPrice;

    @Schema(description = "Giá lớn nhất của sản phẩm (từ các biến thể)", example = "199.99")
    private BigDecimal maxPrice;

    @Schema(description = "Tổng số lượng tồn kho của sản phẩm (tổng từ các biến thể)", example = "150")
    private Integer totalStock;

    @Schema(description = "Trạng thái sản phẩm (1: hoạt động, 0: không hoạt động)", example = "1")
    private Boolean isActive;

    @Schema(description = "Tổng số lượng sản phẩm đã bán (tổng quantity từ order_items)", example = "50")
    private Integer totalSold;
}