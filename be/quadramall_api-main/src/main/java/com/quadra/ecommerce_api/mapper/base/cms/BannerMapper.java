package com.quadra.ecommerce_api.mapper.base.cms;

import com.quadra.ecommerce_api.dto.base.cms.BannerDTO;
import com.quadra.ecommerce_api.entity.cms.Banner;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    Banner toEntity(BannerDTO dto);
    BannerDTO toDto(Banner entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(BannerDTO dto, @MappingTarget Banner entity);
}
