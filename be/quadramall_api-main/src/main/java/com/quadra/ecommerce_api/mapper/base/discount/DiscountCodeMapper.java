package com.quadra.ecommerce_api.mapper.base.discount;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.entity.product.Product;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface DiscountCodeMapper {

    @Mapping(target = "storeId", source = "store.id")
    @Mapping(target = "storeName", source = "store.name")
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.fullName") // ✅ Đã sửa lỗi
    @Mapping(target = "productIds", expression = "java(mapProductIds(discountCode))")
    @Mapping(target = "productNames", expression = "java(mapProductNames(discountCode))")
    @Mapping(target = "applicableProductIds", ignore = true)
    DiscountCodeDTO toDto(DiscountCode discountCode);

    @Mapping(target = "store", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "products", ignore = true)
    DiscountCode toEntity(DiscountCodeDTO dto);

    List<DiscountCodeDTO> toDtoList(List<DiscountCode> discountCodes);

    @Named("mapProductIds")
    default List<Long> mapProductIds(DiscountCode discountCode) {
        if (discountCode.getProducts() == null) {
            return null;
        }
        return discountCode.getProducts().stream()
                .map(Product::getId)
                .collect(Collectors.toList());
    }

    @Named("mapProductNames")
    default List<String> mapProductNames(DiscountCode discountCode) {
        if (discountCode.getProducts() == null) {
            return null;
        }
        return discountCode.getProducts().stream()
                .map(Product::getName)
                .collect(Collectors.toList());
    }

    default DiscountCodeDTO toDtoWithContext(DiscountCode discountCode, List<Long> orderProductIds) {
        DiscountCodeDTO dto = toDto(discountCode);
        if (orderProductIds != null && !orderProductIds.isEmpty()) {
            dto.setApplicableProductIds(discountCode.getApplicableProductIds(orderProductIds));
        }
        return dto;
    }
}
