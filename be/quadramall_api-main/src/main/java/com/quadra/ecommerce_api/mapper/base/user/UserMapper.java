package com.quadra.ecommerce_api.mapper.base.user;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import com.quadra.ecommerce_api.entity.user.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    UserDTO toDto(User entity);
    User toEntity(UserDTO dto);
}
