package com.quadra.ecommerce_api.dto.admin.response.store;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Schema(description = "DTO chứa thông tin nghiệp vụ tổng của cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStatsDto {

    @Schema(description = "Tổng số đơn hàng của cửa hàng", example = "100")
    private Integer totalOrders;

    @Schema(description = "Tỷ lệ hoàn thành đơn hàng của cửa hàng (phần trăm đơn hàng DELIVERED)", example = "95.5")
    private BigDecimal completionRate;

    @Schema(description = "Điểm đánh giá trung bình của tất cả sản phẩm trong cửa hàng", example = "4.5")
    private BigDecimal averageRating;

    @Schema(description = "Tổng doanh thu của cửa hàng (tổng price_at_time từ order_items)", example = "49999.50")
    private BigDecimal totalRevenue;
}
