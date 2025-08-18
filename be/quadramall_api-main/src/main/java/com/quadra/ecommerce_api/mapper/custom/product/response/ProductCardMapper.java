package com.quadra.ecommerce_api.mapper.custom.product.response;

import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.store.response.SellerInfoDTO;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Store;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import static com.quadra.ecommerce_api.common.AddressCommon.extractProvince;

@Mapper(componentModel = "spring")
public interface ProductCardMapper {

    @Mapping(target = "id",           source = "product.id")
    @Mapping(target = "name",         source = "product.name")
    @Mapping(target = "slug",         source = "product.slug")
    @Mapping(target = "thumbnailUrl", source = "product.thumbnailUrl")
    @Mapping(target = "price",        source = "price")
    @Mapping(target = "soldCount",    source = "soldCount")
    @Mapping(target = "rating",       source = "rating")
    @Mapping(target = "fav",          source = "isFav")
    @Mapping(target = "seller",       expression = "java(toSellerInfo(product.getStore()))")
    ProductCardDTO toDto(Product product,
                         double price,
                         long soldCount,
                         double rating,
                         boolean isFav);

    default SellerInfoDTO toSellerInfo(Store store) {
        return SellerInfoDTO.builder()
                .id(store.getId())
                .name(store.getName())
                .province(extractProvince(store.getAddress()))
                .slug(store.getSlug())
                .build();
    }
}

