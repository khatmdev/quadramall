package com.quadra.ecommerce_api.dto.store_owner.request.product.update;


import com.quadra.ecommerce_api.enums.product.AttributeType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Dữ liệu để cập nhật giá trị thuộc tính")
@Data
public class AttributeValueUpdateDto {
    @Schema(description = "ID giá trị thuộc tính (nếu cập nhật, để null nếu tạo mới)", example = "401")
    private Long id;

    @Schema(description = "Tên thuộc tính", example = "Màu sắc", required = true)
    private String attributeName;

    @Schema(description = "Giá trị thuộc tính", example = "Xanh", required = true)
    private String value;

    @Schema(description = "Loại giá trị thuộc tính", example = "COLOR")
    private AttributeType typesValue;
}
