package com.quadra.ecommerce_api.mapper.base.store;

import com.quadra.ecommerce_api.dto.base.store.StoreDTO;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface StoreMapper {
    StoreDTO toDto(Store entity);
    Store toEntity(StoreDTO dto);
}
