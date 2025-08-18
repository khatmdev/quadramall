package com.quadra.ecommerce_api.mapper.base.address;

import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AddressMapper {
    AddressDTO toDto(Address entity);
    Address toEntity(AddressDTO dto);
}
