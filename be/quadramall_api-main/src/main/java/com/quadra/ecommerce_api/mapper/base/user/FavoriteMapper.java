package com.quadra.ecommerce_api.mapper.base.user;


import com.quadra.ecommerce_api.dto.base.user.FavoriteDTO;
import com.quadra.ecommerce_api.entity.user.Favorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "product.id", target = "productId")
    FavoriteDTO toDto(Favorite favorite);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    Favorite toEntity(FavoriteDTO dto);
}
