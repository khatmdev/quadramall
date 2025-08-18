package com.quadra.ecommerce_api.dto.admin.response.store;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "DTO chứa toàn bộ dữ liệu cho trang admin quản lý cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreManagementResponseDto {

    @Schema(description = "Thông tin cửa hàng")
    private StoreDto store;

    @Schema(description = "Danh sách sản phẩm của cửa hàng")
    private List<ProductDto> products;

    @Schema(description = "Thống kê nghiệp vụ của cửa hàng")
    private ProductStatsDto stats;
}

