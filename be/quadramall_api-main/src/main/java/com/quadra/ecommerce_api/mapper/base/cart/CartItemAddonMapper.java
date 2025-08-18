package com.quadra.ecommerce_api.mapper.base.cart;

import com.quadra.ecommerce_api.dto.base.cart.CartItemAddonDTO;
import com.quadra.ecommerce_api.entity.cart.CartItemAddon;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {CartItemMapper.class})
public interface CartItemAddonMapper {
    CartItemAddonDTO toDto(CartItemAddon entity);
    CartItemAddon toEntity(CartItemAddonDTO dto);
}
