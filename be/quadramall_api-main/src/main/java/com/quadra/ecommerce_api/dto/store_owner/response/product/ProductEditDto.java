package com.quadra.ecommerce_api.dto.store_owner.response.product;

import com.quadra.ecommerce_api.enums.product.AttributeType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "DTO for editing product details")
public class ProductEditDto {
    @Schema(description = "Unique identifier of the product", example = "1")
    private Long id;

    @Schema(description = "Name of the product", example = "Smartphone XYZ", required = true)
    private String name;

    @Schema(description = "Description of the product, can include text and image URLs in JSON format", example = "[{\"type\":\"text\",\"content\":\"This is a great smartphone\"},{\"type\":\"image\",\"url\":\"https://res.cloudinary.com/.../image.jpg\"}]")
    private String description;

    @Schema(description = "URL-friendly slug for the product", example = "smartphone-xyz")
    private String slug;

    @Schema(description = "ID of the store to which the product belongs", example = "1", required = true)
    private Long storeId;

    @Schema(description = "ID of the item type (category) for the product", example = "2", required = true)
    private Long itemTypeId;

    @Schema(description = "Name of the item type", example = "Electronics")
    private String itemTypeName;

    @Schema(description = "Indicates if the product is active", example = "true")
    private Boolean isActive;

    @Schema(description = "URL of the product's thumbnail image", example = "https://res.cloudinary.com/.../thumbnail.jpg")
    private String thumbnailUrl;

    @Schema(description = "URL of the product's video", example = "https://res.cloudinary.com/.../video.mp4")
    private String videoUrl;

    @Schema(description = "List of product variants")
    private List<VariantEditDto> variants;

    @Schema(description = "List of addon groups for the product")
    private List<AddonGroupEditDto> addonGroups;

    @Schema(description = "List of product specifications")
    private List<SpecificationEditDto> specifications;

    @Schema(description = "List of product images")
    private List<ProductImageEditDto> images;

    @Data
    @Schema(description = "DTO for a product variant")
    public static class VariantEditDto {
        @Schema(description = "Unique identifier of the variant", example = "1")
        private Long id;

        @Schema(description = "Stock Keeping Unit (SKU) of the variant", example = "P1-V1")
        private String sku;

        @Schema(description = "Price of the variant", example = "999.99")
        private BigDecimal price;

        @Schema(description = "Stock quantity of the variant", example = "100")
        private Integer stockQuantity;

        @Schema(description = "Indicates if the variant is active", example = "true")
        private Boolean isActive;

        @Schema(description = "URL of the variant's image", example = "https://res.cloudinary.com/.../variant.jpg")
        private String imageUrl;

        @Schema(description = "List of product details (attributes) for the variant")
        private List<ProductDetailEditDto> productDetails;
    }

    @Data
    @Schema(description = "DTO for a product detail (attribute)")
    public static class ProductDetailEditDto {
        @Schema(description = "Unique identifier of the attribute value", example = "1")
        private Long attributeValueId;

        @Schema(description = "Name of the attribute", example = "Color")
        private String attributeName;

        @Schema(description = "Value of the attribute", example = "Red")
        private String value;

        @Schema(description = "Type of the attribute value", example = "ALL")
        private AttributeType typesValue;
    }

    @Data
    @Schema(description = "DTO for an addon group")
    public static class AddonGroupEditDto {
        @Schema(description = "Unique identifier of the addon group", example = "1")
        private Long id;

        @Schema(description = "Name of the addon group", example = "Extra Accessories")
        private String name;

        @Schema(description = "Maximum number of addons that can be chosen", example = "2")
        private Integer maxChoice;

        @Schema(description = "List of addons in the group")
        private List<AddonEditDto> addons;
    }

    @Data
    @Schema(description = "DTO for an addon")
    public static class AddonEditDto {
        @Schema(description = "Unique identifier of the addon", example = "1")
        private Long id;

        @Schema(description = "Name of the addon", example = "Extended Warranty")
        private String name;

        @Schema(description = "Price adjustment for the addon", example = "50.00")
        private BigDecimal price;

        @Schema(description = "Indicates if the addon is active", example = "true")
        private boolean active;
    }

    @Data
    @Schema(description = "DTO for a product specification")
    public static class SpecificationEditDto {
        @Schema(description = "Unique identifier of the specification", example = "1")
        private Long specificationId;

        @Schema(description = "Name of the specification", example = "Screen Size")
        private String specificationName;

        @Schema(description = "Value of the specification", example = "6.5 inches")
        private String value;
    }

    @Data
    @Schema(description = "DTO for a product image")
    public static class ProductImageEditDto {
        @Schema(description = "Unique identifier of the image", example = "1")
        private Long id;

        @Schema(description = "URL of the image", example = "https://res.cloudinary.com/.../image.jpg")
        private String url;

        @Schema(description = "Alternative text for the image", example = "Product Image")
        private String altText;
    }
}