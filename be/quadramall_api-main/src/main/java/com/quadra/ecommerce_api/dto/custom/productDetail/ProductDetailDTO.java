package com.quadra.ecommerce_api.dto.custom.productDetail;


import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductDetailDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private String videoUrl;
    private Long storeId;
    private BigDecimal minPrice; // Thêm trường minPrice
    private BigDecimal maxPrice; // Thêm trường maxPrice
    private FlashSaleDTO flashSale;
    private Long categoryId;
    private List<AttributeDTO> availableAttributes;
    private List<VariantDTO> variants;
    private List<VariantAttributeDTO> variantDetails;
    private List<AddonGroupDTO> addonGroups;
    private List<ProductImageDTO> images;
    private StoreDTO store;
    private List<DiscountCodeDTO> discountCodes;
    private List<SpecificationDTO> specifications;
    private Long soldCount;
    private Double averageRating;
    private Long reviewCount; // Thêm reviewCount trực tiếp
    private List<ReviewDTO> reviews;
    private LocalDateTime flashSaleEndTime;
    private boolean isSamePrice;
    private Integer totalStockQuantity;
}
