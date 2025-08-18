package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.AddonGroupDTO;
import com.quadra.ecommerce_api.entity.product.AddonGroup;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface AddonGroupMapper {
    AddonGroupDTO toDto(AddonGroup entity);
    AddonGroup toEntity(AddonGroupDTO dto);
}
