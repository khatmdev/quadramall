/* 
package com.quadra.ecommerce_api.mapper.base.store;

import com.quadra.ecommerce_api.context.CycleAvoidingMappingContext;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import com.quadra.ecommerce_api.entity.store.ItemType;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ItemTypeMapper {
    ItemTypeDTO toDto(ItemType entity, @Context CycleAvoidingMappingContext mappingContext);

    ItemType toEntity(ItemTypeDTO dto, @Context CycleAvoidingMappingContext mappingContext);

    @Named("withContext")
    default ItemTypeDTO toDto(ItemType entity) {
        return toDto(entity, new CycleAvoidingMappingContext());
    }

    @Named("withContext")
    default ItemType toEntity(ItemTypeDTO dto) {
        return toEntity(dto, new CycleAvoidingMappingContext());
    }
}
*/

package com.quadra.ecommerce_api.mapper.base.store;

import com.quadra.ecommerce_api.context.CycleAvoidingMappingContext;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import com.quadra.ecommerce_api.entity.store.ItemType;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import org.mapstruct.Context;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ItemTypeMapper {

    // public method để sử dụng ngoài
    default ItemTypeDTO toDto(ItemType entity) {
        return toDto(entity, new CycleAvoidingMappingContext());
    }

    default ItemType toEntity(ItemTypeDTO dto) {
        return toEntity(dto, new CycleAvoidingMappingContext());
    }

    // dùng nội bộ kèm context để tránh vòng lặp
    default ItemTypeDTO toDto(ItemType entity, @Context CycleAvoidingMappingContext context) {
        if (entity == null) return null;

        ItemTypeDTO cached = context.getMappedInstance(entity, ItemTypeDTO.class);
        if (cached != null) return cached;

        ItemTypeDTO dto = new ItemTypeDTO();
        context.storeMappedInstance(entity, dto);

        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSlug(entity.getSlug());
        dto.setDescription(entity.getDescription());
        dto.setIconUrl(entity.getIconUrl());
        dto.setIsActive(entity.isActive());

        if (entity.getParent() != null) {
            dto.setParent(toDto(entity.getParent(), context));  // recursive
        }

        return dto;
    }

    default ItemType toEntity(ItemTypeDTO dto, @Context CycleAvoidingMappingContext context) {
        if (dto == null) return null;

        ItemType cached = context.getMappedInstance(dto, ItemType.class);
        if (cached != null) return cached;

        ItemType entity = new ItemType();
        context.storeMappedInstance(dto, entity);

        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSlug(dto.getSlug());
        entity.setDescription(dto.getDescription());
        entity.setIconUrl(dto.getIconUrl());
        entity.setActive(Boolean.TRUE.equals(dto.getIsActive()));

        if (dto.getParent() != null) {
            entity.setParent(toEntity(dto.getParent(), context));  // recursive
        }

        return entity;
    }
}

