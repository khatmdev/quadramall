package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.SpecificationValueDTO;
import com.quadra.ecommerce_api.entity.product.SpecificationValue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {SpecificationMapper.class})
public interface SpecificationValueMapper {
    SpecificationValueDTO toDto(SpecificationValue entity);
    SpecificationValue toEntity(SpecificationValueDTO dto);
}
