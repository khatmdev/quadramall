package com.quadra.ecommerce_api.mapper.base.discount;

import com.quadra.ecommerce_api.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DiscountUserMapper { // ĐỔI TÊN TỪ UserMapper → DiscountUserMapper

    @Named("mapUserToId")
    static Long mapUserToId(User user) {
        return user != null ? user.getId() : null;
    }

    @Named("mapUserToName")
    static String mapUserToName(User user) {
        return user != null ? user.getFullName() : null;
    }

    @Named("mapIdToUser")
    static User mapIdToUser(Long id) {
        if (id == null) return null;
        User user = new User();
        user.setId(id);
        return user;
    }
}