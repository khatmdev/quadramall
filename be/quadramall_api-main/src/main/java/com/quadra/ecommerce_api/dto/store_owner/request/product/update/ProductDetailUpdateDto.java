package com.quadra.ecommerce_api.dto.store_owner.request.product.update;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Dữ liệu để cập nhật chi tiết thuộc tính của biến thể")
@Data
public class ProductDetailUpdateDto {
    @Schema(description = "ID chi tiết thuộc tính (nếu cập nhật, để null nếu tạo mới)", example = "301")
    private Long id;

    @Schema(description = "Thông tin giá trị thuộc tính", implementation = AttributeValueUpdateDto.class)
    private AttributeValueUpdateDto attributeValue;
}
