package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.ProductDetailDTO;
import com.quadra.ecommerce_api.entity.product.ProductDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductVariantMapper.class, AttributeValueMapper.class})
public interface ProductDetailMapper {
    ProductDetailDTO toDto(ProductDetail entity);
    ProductDetail toEntity(ProductDetailDTO dto);
}
