package com.quadra.ecommerce_api.mapper.store_owner.request.product;

import com.quadra.ecommerce_api.dto.store_owner.request.product.*;
import com.quadra.ecommerce_api.entity.product.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoreOwnerProductMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "itemType", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "slug", source = "slug")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
    @Mapping(target = "videoUrl", source = "videoUrl")
    Product toProduct(ProductCreateDto dto);

    ProductCreateDto toProductCreateDto(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sku", source = "sku")
    @Mapping(target = "imageUrl", source = "imageUrl")
    ProductVariant toProductVariant(ProductVariantCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "attributeValue", ignore = true)
    ProductDetail toProductDetail(ProductDetailCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    AddonGroup toAddonGroup(AddonGroupCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "addonGroup", ignore = true)
    @Mapping(target = "active", source = "active")
    Addon toAddon(AddonCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "specification", ignore = true)
    @Mapping(target = "value", source = "value")
    SpecificationValue toSpecificationValue(SpecificationValueCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "imageUrl", source = "imageUrl")
    ProductImage toProductImage(ProductImageCreateDto dto);

    @Mapping(target = "id", ignore = true)
    Attribute toAttribute(AttributeCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "attribute", ignore = true)
    @Mapping(target = "value", source = "value")
    AttributeValue toAttributeValue(AttributeValueCreateDto dto);
}