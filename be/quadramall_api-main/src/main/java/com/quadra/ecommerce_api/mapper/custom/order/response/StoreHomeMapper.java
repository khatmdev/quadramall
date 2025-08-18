package com.quadra.ecommerce_api.mapper.custom.order.response;


import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.entity.store.Store;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoreHomeMapper {
    @Mapping(target = "rating", source = "rating")
    StoreHomeResponseDTO toDto(Store store, double rating);
}
