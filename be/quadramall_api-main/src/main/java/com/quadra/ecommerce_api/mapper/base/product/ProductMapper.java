package com.quadra.ecommerce_api.mapper.base.product;

import com.quadra.ecommerce_api.dto.base.product.ProductDTO;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.mapper.base.store.CategoryMapper;
import com.quadra.ecommerce_api.mapper.base.store.ItemTypeMapper;
import com.quadra.ecommerce_api.mapper.base.store.StoreMapper;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, StoreMapper.class, ItemTypeMapper.class})
public interface ProductMapper {
    ProductDTO toDto(Product entity);
    Product toEntity(ProductDTO dto);
}
