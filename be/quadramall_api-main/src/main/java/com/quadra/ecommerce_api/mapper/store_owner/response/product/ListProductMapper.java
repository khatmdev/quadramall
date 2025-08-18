package com.quadra.ecommerce_api.mapper.store_owner.response.product;


import com.quadra.ecommerce_api.dto.store_owner.response.product.ProductDTO;
import com.quadra.ecommerce_api.entity.product.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", implementationName = "ListProductMapperImpl")
public interface ListProductMapper {
    @Mapping(target = "slug", source = "slug")
    @Mapping(target = "image", source = "thumbnailUrl")
    @Mapping(target = "status", source = "active")
    @Mapping(target = "totalStock", ignore = true) // Tính toán trong service
    @Mapping(target = "itemType", ignore = true)   // Tính toán trong service
    @Mapping(target = "minPrice", ignore = true)   // Tính toán trong service
    @Mapping(target = "maxPrice", ignore = true)   // Tính toán trong service
    ProductDTO toDTO(Product product);
}
