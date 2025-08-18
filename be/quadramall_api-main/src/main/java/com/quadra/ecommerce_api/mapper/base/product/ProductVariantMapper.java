package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.ProductVariantDTO;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface ProductVariantMapper {
    ProductVariantDTO toDto(ProductVariant entity);
    ProductVariant toEntity(ProductVariantDTO dto);
}
