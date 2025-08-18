package com.quadra.ecommerce_api.dto.store_owner.request.product.update;

import com.quadra.ecommerce_api.dto.store_owner.request.product.ProductDetailCreateDto;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Dữ liệu để cập nhật biến thể sản phẩm")
@Data
public class ProductVariantUpdateDto {
    @Schema(description = "ID biến thể (nếu cập nhật, để null nếu tạo mới)", example = "201")
    private Long id;

    @Schema(description = "Mã SKU của biến thể", example = "P101-V1")
    private String sku;

    @Schema(description = "Giá bán của biến thể", example = "99000")
    private BigDecimal price;

    @Schema(description = "Số lượng tồn kho", example = "50")
    private Integer stockQuantity;

    @Schema(description = "Trạng thái hoạt động của biến thể", example = "true")
    private Boolean isActive;

    @Schema(description = "URL ảnh của biến thể", example = "https://example.com/images/variant201.jpg")
    private String imageUrl;

    @ArraySchema(schema = @Schema(description = "Danh sách chi tiết thuộc tính của biến thể", implementation = ProductDetailUpdateDto.class))
    private List<ProductDetailUpdateDto> productDetails;
}