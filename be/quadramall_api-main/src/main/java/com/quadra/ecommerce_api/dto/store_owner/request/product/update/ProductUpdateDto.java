package com.quadra.ecommerce_api.dto.store_owner.request.product.update;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Schema(description = "Dữ liệu để cập nhật thông tin sản phẩm")
@Data
public class ProductUpdateDto {
    @Schema(description = "ID sản phẩm cần cập nhật", example = "101", required = true)
    private Long id;

    @Schema(description = "Tên sản phẩm", example = "Áo thun nam basic", required = true)
    private String name;

    @Schema(description = "Slug của sản phẩm (tùy chọn, nếu không cung cấp sẽ tự động tạo)", example = "ao-thun-nam-basic-101")
    private String slug;

    @Schema(description = "URL ảnh đại diện sản phẩm", example = "https://example.com/images/product101.jpg")
    private String thumbnailUrl;

    @Schema(description = "URL video giới thiệu sản phẩm", example = "https://example.com/videos/product101.mp4")
    private String videoUrl;

    @Schema(description = "Mô tả sản phẩm", example = "Áo thun nam chất liệu cotton, thoáng mát, phù hợp mặc hàng ngày")
    private String description;

    @Schema(description = "ID cửa hàng sở hữu sản phẩm", example = "1", required = true)
    private Long storeId;

    @Schema(description = "ID loại sản phẩm", example = "1", required = true)
    private Long itemTypeId;

    @ArraySchema(schema = @Schema(description = "Danh sách biến thể sản phẩm", implementation = ProductVariantUpdateDto.class))
    private List<ProductVariantUpdateDto> variants;

    @ArraySchema(schema = @Schema(description = "Danh sách nhóm tùy chọn bổ sung", implementation = AddonGroupUpdateDto.class))
    private List<AddonGroupUpdateDto> addonGroups;

    @ArraySchema(schema = @Schema(description = "Danh sách thông số kỹ thuật", implementation = SpecificationValueUpdateDto.class))
    private List<SpecificationValueUpdateDto> specifications;

    @ArraySchema(schema = @Schema(description = "Danh sách hình ảnh sản phẩm", implementation = ProductImageUpdateDto.class))
    private List<ProductImageUpdateDto> images;
}
