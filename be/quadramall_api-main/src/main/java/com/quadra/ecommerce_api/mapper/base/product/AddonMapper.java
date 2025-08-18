package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.AddonDTO;
import com.quadra.ecommerce_api.entity.product.Addon;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {AddonGroupMapper.class})
public interface AddonMapper {
    AddonDTO toDto (Addon entity);
    Addon toEntity (AddonDTO dto);
}
