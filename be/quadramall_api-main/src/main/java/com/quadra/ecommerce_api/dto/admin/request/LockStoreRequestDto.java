package com.quadra.ecommerce_api.dto.admin.request;


import com.quadra.ecommerce_api.enums.store.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Schema(description = "DTO để khóa hoặc mở khóa cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockStoreRequestDto {
    @Schema(description = "Trạng thái cửa hàng (ACTIVE, INACTIVE, LOCKED)", example = "LOCKED")
    @NotNull(message = "Store status is required")
    private StoreStatus storeStatus;

    @Schema(description = "Lý do khóa cửa hàng (yêu cầu khi trạng thái là LOCKED)", example = "Vi phạm chính sách bán hàng")
    private String lockReason;
}
