package com.quadra.ecommerce_api.mapper.base.store;

import com.quadra.ecommerce_api.context.CycleAvoidingMappingContext;
import com.quadra.ecommerce_api.dto.base.store.CategoryDTO;
import com.quadra.ecommerce_api.entity.store.Category;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {StoreMapper.class})
public interface CategoryMapper {
    @Mapping(target = "parent", ignore = true)
    CategoryDTO toDto(Category entity, @Context CycleAvoidingMappingContext mappingContext);

    @Mapping(target = "parent", ignore = true)
    Category toEntity(CategoryDTO dto, @Context CycleAvoidingMappingContext mappingContext);

    default CategoryDTO toDto(Category entity) {
        return toDto(entity, new CycleAvoidingMappingContext());
    }

    default Category toEntity(CategoryDTO dto) {
        return toEntity(dto, new CycleAvoidingMappingContext());
    }
}