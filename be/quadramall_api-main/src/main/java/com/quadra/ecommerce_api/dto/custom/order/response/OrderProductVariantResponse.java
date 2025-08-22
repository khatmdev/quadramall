package com.quadra.ecommerce_api.dto.custom.order.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết biến thể sản phẩm trong đơn hàng")
public class OrderProductVariantResponse {
    @Schema(description = "Mã định danh duy nhất của biến thể sản phẩm trong đơn hàng", example = "123")
    private Long id;

    @Schema(description = "Thông tin sản phẩm liên quan đến biến thể")
    private OrderProductResponse product;

    @Schema(description = "Thông tin cửa hàng bán biến thể sản phẩm")
    private OrderStoreResponse store;

    @Schema(description = "Mã SKU của biến thể sản phẩm", example = "ABC123")
    private String sku;

    @Schema(description = "Giá của biến thể sản phẩm", example = "100.00")
    private BigDecimal price;

    @Schema(description = "Số lượng tồn kho của biến thể sản phẩm", example = "50")
    private Integer stockQuantity;

    @Schema(description = "Trạng thái hoạt động của biến thể sản phẩm", example = "true")
    private Boolean isActive;

    @Schema(description = "URL hình ảnh của biến thể sản phẩm", example = "https://example.com/image.jpg")
    private String imageUrl;

    @Schema(description = "Văn bản thay thế cho hình ảnh", example = "Hình ảnh biến thể sản phẩm")
    private String altText;

    @Schema(description = "Thời điểm tạo biến thể sản phẩm", example = "2023-01-01T00:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời điểm cập nhật cuối cùng của biến thể sản phẩm", example = "2023-01-01T00:00:00")
    private LocalDateTime updatedAt;
}