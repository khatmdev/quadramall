package com.quadra.ecommerce_api.dto.admin.response.store;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "DTO chứa thông tin chi tiết của cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDto {

    @Schema(description = "ID của cửa hàng", example = "1")
    private Long storeId;

    @Schema(description = "Tên cửa hàng", example = "Example Store")
    private String storeName;

    @Schema(description = "Địa chỉ cửa hàng", example = "123 Main St")
    private String storeAddress;

    @Schema(description = "Mô tả cửa hàng", example = "A great store")
    private String storeDescription;

    @Schema(description = "URL logo của cửa hàng", example = "https://example.com/logo.png")
    private String storeLogoUrl;

    @Schema(description = "Trạng thái cửa hàng", example = "ACTIVE")
    private String storeStatus;

    @Schema(description = "Lý do khóa cửa hàng")
    private String lockReason;

    @Schema(description = "Thời gian tạo cửa hàng", example = "2025-07-16T23:56:00")
    private LocalDateTime storeCreatedAt;

    @Schema(description = "Thông tin chủ cửa hàng")
    private OwnerDto owner;
}