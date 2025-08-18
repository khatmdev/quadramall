package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.AttributeDTO;
import com.quadra.ecommerce_api.entity.product.Attribute;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttributeMapper {
    AttributeDTO toDto(Attribute entity);
    Attribute toEntity(AttributeDTO dto);
}
