package com.quadra.ecommerce_api.dto.store_owner.request.product.update;


import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Schema(description = "Dữ liệu để cập nhật nhóm tùy chọn bổ sung")
@Data
public class AddonGroupUpdateDto {
    @Schema(description = "ID nhóm tùy chọn (nếu cập nhật, để null nếu tạo mới)", example = "501")
    private Long id;

    @Schema(description = "Tên nhóm tùy chọn", example = "Kích thước thêm", required = true)
    private String name;

    @Schema(description = "Số lượng lựa chọn tối đa", example = "2", required = true)
    private Integer maxChoice;

    @ArraySchema(schema = @Schema(description = "Danh sách tùy chọn bổ sung", implementation = AddonUpdateDto.class))
    private List<AddonUpdateDto> addons;
}
