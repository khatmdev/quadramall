package com.quadra.ecommerce_api.mapper.base.order;

import com.quadra.ecommerce_api.dto.base.order.OrderDTO;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.mapper.base.discount.DiscountCodeMapper;
import com.quadra.ecommerce_api.mapper.base.store.StoreMapper;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, StoreMapper.class, DiscountCodeMapper.class})
public interface OrderMapper {
    OrderDTO toDto(Order entity);
    Order toEntity(OrderDTO dto);
}
