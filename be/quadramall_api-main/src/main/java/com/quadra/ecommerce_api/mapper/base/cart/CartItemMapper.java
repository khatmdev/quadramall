package com.quadra.ecommerce_api.mapper.base.cart;

import com.quadra.ecommerce_api.dto.base.cart.CartItemDTO;
import com.quadra.ecommerce_api.entity.cart.CartItem;
import com.quadra.ecommerce_api.mapper.base.product.ProductVariantMapper;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductVariantMapper.class})
public interface CartItemMapper {
    CartItemDTO toDto(CartItem entity);
    CartItem toEntity(CartItemDTO dto);
}