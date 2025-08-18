package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.AttributeValueDTO;
import com.quadra.ecommerce_api.entity.product.AttributeValue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {AttributeMapper.class})
public interface AttributeValueMapper {
    AttributeValueDTO toDto(AttributeValue entity);
    AttributeValue toEntity(AttributeValueDTO dto);
}
