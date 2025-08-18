package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.ProductImageDTO;
import com.quadra.ecommerce_api.entity.product.ProductImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface ProductImageMapper {
    ProductImageDTO toDto(ProductImage entity);
    ProductImage toEntity(ProductImageDTO dto);
}
