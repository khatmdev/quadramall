package com.quadra.ecommerce_api.mapper.base.user;

import com.quadra.ecommerce_api.dto.base.user.RoleDTO;
import com.quadra.ecommerce_api.entity.user.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDTO toDto(Role entity);
    Role toEntity(RoleDTO dto);
}
