package com.quadra.ecommerce_api.dto.buyer.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO chứa thông tin sản phẩm")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    @Schema(description = "ID của sản phẩm", example = "1")
    private Long id;

    @Schema(description = "Tên sản phẩm", example = "iPhone 13")
    private String name;

    @Schema(description = "Giá sản phẩm", example = "799.99")
    private double price;

    @Schema(description = "Slug của sản phẩm", example = "iphone-13")
    private String slug;

    @Schema(description = "URL ảnh thumbnail của sản phẩm", example = "https://example.com/iphone13.png")
    private String thumbnailUrl;

    @Schema(description = "Điểm đánh giá trung bình của sản phẩm", example = "4.5")
    private double rating;

    @Schema(description = "Số lượng sản phẩm đã bán", example = "1000")
    private long soldCount;

    @Schema(description = "Sản phẩm có được người dùng yêu thích hay không", example = "true")
    private boolean isFav;
}