package com.quadra.ecommerce_api.mapper.store_owner.request.product;

import com.quadra.ecommerce_api.dto.store_owner.request.product.update.*;
import com.quadra.ecommerce_api.entity.product.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoreOwnerProductUpdateMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "itemType", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "slug", source = "slug")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
    @Mapping(target = "videoUrl", source = "videoUrl")
    Product toProduct(ProductUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sku", source = "sku")
    @Mapping(target = "imageUrl", source = "imageUrl")
    ProductVariant toProductVariant(ProductVariantUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "attributeValue", ignore = true)
    ProductDetail toProductDetail(ProductDetailUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "product", ignore = true)
    AddonGroup toAddonGroup(AddonGroupUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "addonGroup", ignore = true)
    @Mapping(target = "name", source = "name")
    @Mapping(target = "priceAdjust", source = "priceAdjust")
    @Mapping(target = "active", source = "active")
    Addon toAddon(AddonUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "specification", ignore = true)
    @Mapping(target = "value", source = "value")
    SpecificationValue toSpecificationValue(SpecificationUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "specification", ignore = true)
    @Mapping(target = "value", source = "value")
    SpecificationValue toSpecificationValue(SpecificationValueUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "imageUrl", source = "imageUrl")
    ProductImage toProductImage(ProductImageUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "typesValue", source = "typesValue")
    Attribute toAttribute(AttributeUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "attribute", ignore = true)
    @Mapping(target = "value", source = "value")
    AttributeValue toAttributeValue(AttributeValueUpdateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "slug", source = "slug")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
    @Mapping(target = "videoUrl", source = "videoUrl")
    @Mapping(target = "storeId", source = "store.id")
    @Mapping(target = "itemTypeId", source = "itemType.id")
    ProductUpdateDto toProductDTO(Product entity);
}