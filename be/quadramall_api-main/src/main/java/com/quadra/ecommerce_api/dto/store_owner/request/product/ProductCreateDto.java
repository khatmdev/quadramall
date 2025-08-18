package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;


import java.util.List;

@Data
public class ProductCreateDto {
    private String name;              // Tên sản phẩm
    private String slug;              // Slug (định danh duy nhất)
    private String description;       // Mô tả sản phẩm
    private String thumbnailUrl;
    private String videoUrl;
    private Long storeId;             // ID cửa hàng
    private Long itemTypeId;          // ID danh mục
    private boolean isActive;         // Trạng thái hoạt động
    private List<ProductVariantCreateDto> variants;  // Danh sách variant (có thể null)
    private List<AddonGroupCreateDto> addonGroups;   // Danh sách nhóm addon
    private List<SpecificationValueCreateDto> specifications; // Danh sách thông số kỹ thuật
    private List<ProductImageCreateDto> images;      // Danh sách hình ảnh
}
