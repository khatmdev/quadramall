package com.quadra.ecommerce_api.mapper.base.order;

import com.quadra.ecommerce_api.dto.base.order.OrderItemDTO;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.mapper.base.product.ProductVariantMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductVariantMapper.class, OrderMapper.class})
public interface OrderItemMapper {
    OrderItemDTO toDto(OrderItem entity);
    OrderItem toEntity(OrderItemDTO dto);
}
