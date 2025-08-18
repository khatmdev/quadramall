package com.quadra.ecommerce_api.mapper.base.order;

import com.quadra.ecommerce_api.dto.base.order.ProductReviewDTO;
import com.quadra.ecommerce_api.entity.order.ProductReview;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface ProductReviewMapper {
    ProductReviewDTO toDto(ProductReview entity);
    ProductReview toEntity(ProductReviewDTO dto);
}
