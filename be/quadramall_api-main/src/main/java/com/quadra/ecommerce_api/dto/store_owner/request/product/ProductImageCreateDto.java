package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductImageCreateDto {
    private String imageUrl;
    private String altText;           // Văn bản thay thế
    private boolean isThumbnail;      // Có phải ảnh đại diện không
}
