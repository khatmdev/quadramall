package com.quadra.ecommerce_api.dto.store_owner.request.product.update;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Schema(description = "Dữ liệu để cập nhật tùy chọn bổ sung")
@Data
public class AddonUpdateDto {
    @Schema(description = "ID tùy chọn bổ sung (nếu cập nhật, để null nếu tạo mới)", example = "601")
    private Long id;

    @Schema(description = "Tên tùy chọn bổ sung", example = "Thêm size lớn", required = true)
    private String name;

    @Schema(description = "Giá điều chỉnh khi chọn tùy chọn", example = "20000")
    private BigDecimal priceAdjust;

    @Schema(description = "Trạng thái hoạt động của tùy chọn", example = "true")
    private Boolean active;
}
