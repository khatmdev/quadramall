package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.SpecificationDTO;
import com.quadra.ecommerce_api.entity.product.Specification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SpecificationMapper {
    SpecificationDTO toDto(Specification entity);
    Specification toEntity(SpecificationDTO dto);
}
