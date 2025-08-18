package com.quadra.ecommerce_api.dto.store_owner.request.product.update;


import com.quadra.ecommerce_api.enums.product.AttributeType;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Schema(description = "Dữ liệu để cập nhật thuộc tính")
@Data
public class AttributeUpdateDto {
    @Schema(description = "ID thuộc tính (nếu cập nhật, để null nếu tạo mới)", example = "901")
    private Long id;

    @Schema(description = "Tên thuộc tính", example = "Màu sắc", required = true)
    private String name;

    @Schema(description = "Loại giá trị thuộc tính", example = "COLOR")
    private AttributeType typesValue;

    @ArraySchema(schema = @Schema(description = "Danh sách giá trị thuộc tính", implementation = AttributeValueUpdateDto.class))
    private List<AttributeValueUpdateDto> values;
}
