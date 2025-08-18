package com.quadra.ecommerce_api.dto.store_owner.request.product.update;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Dữ liệu để cập nhật thông số kỹ thuật")
@Data
public class SpecificationUpdateDto {
    @Schema(description = "ID thông số kỹ thuật (nếu cập nhật, để null nếu tạo mới)", example = "701")
    private Long id;

    @Schema(description = "Tên thông số", example = "Chất liệu", required = true)
    private String name;

    @Schema(description = "Giá trị thông số", example = "Cotton 100%")
    private String value;
}
