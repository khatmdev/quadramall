package com.quadra.ecommerce_api.dto.custom.order.response;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Thông tin cửa hàng trong đơn hàng")
public class OrderStoreResponse {
        @Schema(description = "Mã định danh duy nhất của cửa hàng", example = "1")
        private Long id;

        @Schema(description = "Tên của cửa hàng", example = "Cửa hàng ABC")
        private String name;

        @Schema(description = "URL hoặc đường dẫn đến hình ảnh của cửa hàng", example = "https://example.com/image.jpg")
        private String image;

        @Schema(description = "Danh sách các giảm giá có sẵn tại cửa hàng")
        private List<DiscountCodeDTO> availableDiscounts;
}