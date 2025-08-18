package com.quadra.ecommerce_api.mapper.base.shipping;

import com.quadra.ecommerce_api.dto.base.shipping.ShippingPartnerDTO;
import com.quadra.ecommerce_api.entity.shipping.ShippingPartner;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ShippingPartnerMapper {
    ShippingPartnerDTO toDto(ShippingPartner entity);
    ShippingPartner toEntity(ShippingPartnerDTO dto);
}
