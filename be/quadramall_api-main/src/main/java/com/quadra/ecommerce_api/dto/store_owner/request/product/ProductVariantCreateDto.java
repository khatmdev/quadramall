package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantCreateDto {
    private String sku;
    private BigDecimal price;
    private int stockQuantity;
    private boolean isActive;
    private String imageUrl;
    private String altText;
    private List<ProductDetailCreateDto> productDetails;
}