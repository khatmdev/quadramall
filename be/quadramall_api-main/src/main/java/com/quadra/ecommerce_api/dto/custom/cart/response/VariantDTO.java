package com.quadra.ecommerce_api.dto.custom.cart.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VariantDTO {
    private Long id; // ID của variant
    private String sku; // SKU để liên kết với các bảng khác
}
