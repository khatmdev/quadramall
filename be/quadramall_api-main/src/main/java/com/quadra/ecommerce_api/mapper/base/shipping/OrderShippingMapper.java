package com.quadra.ecommerce_api.mapper.base.shipping;

import com.quadra.ecommerce_api.dto.base.shipping.OrderShippingDTO;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.mapper.base.order.OrderMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {OrderMapper.class, ShippingPartnerMapper.class})
public interface OrderShippingMapper {
    OrderShippingDTO toDto(OrderShipping entity);
    OrderShipping toEntity(OrderShippingDTO dto);
}
