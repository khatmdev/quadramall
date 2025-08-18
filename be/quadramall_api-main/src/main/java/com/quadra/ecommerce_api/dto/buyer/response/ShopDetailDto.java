package com.quadra.ecommerce_api.dto.buyer.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "DTO chứa thông tin chi tiết của cửa hàng")
@Data
public class ShopDetailDto {

    @Schema(description = "ID của cửa hàng", example = "1")
    private Long storeId;

    @Schema(description = "Tên cửa hàng", example = "Quadra Store")
    private String storeName;

    @Schema(description = "Slug của cửa hàng", example = "quadra-store")
    private String storeSlug;

    @Schema(description = "Địa chỉ cửa hàng", example = "123 Đường Láng, Hà Nội")
    private String address;

    @Schema(description = "Mô tả cửa hàng", example = "Cửa hàng bán đồ điện tử chất lượng cao")
    private String description;

    @Schema(description = "URL logo cửa hàng", example = "https://example.com/logo.png")
    private String logoUrl;

    @Schema(description = "Trạng thái cửa hàng", example = "ACTIVE")
    private String status;

    @Schema(description = "trạng thái yêu thích trang cảu người dùng")
    private boolean isFavorite;

    @Schema(description = "Số lượng sản phẩm của cửa hàng", example = "150")
    private Integer productCount;

    @Schema(description = "Số người theo dõi cửa hàng", example = "1000")
    private Integer followerCount;

    @Schema(description = "Số lượng đánh giá của cửa hàng", example = "500")
    private Integer reviewCount;

    @Schema(description = "Điểm đánh giá trung bình của cửa hàng", example = "4.5")
    private Double averageRating;

    @Schema(description = "Ngày tham gia của cửa hàng", example = "2023-01-15")
    private LocalDate joinDate;

    @Schema(description = "Tỉ lệ phản hồi chat của cửa hàng (phần trăm)", example = "95.5")
    private Double chatResponseRate;

    @Schema(description = "Danh sách danh mục sản phẩm của cửa hàng")
    private List<CategoryDto> categories;

    @Schema(description = "Danh sách sản phẩm của cửa hàng")
    private List<ProductDto> products;

    @Schema(description = "Danh sách mã giảm giá của cửa hàng")
    private List<DiscountCodeDto> discountCodes;

}