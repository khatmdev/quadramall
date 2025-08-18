package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddonCreateDto {
    private String name;              // Tên addon
    private BigDecimal priceAdjust;   // Giá điều chỉnh (cộng thêm hoặc trừ đi)
    private boolean active;         // Trạng thái hoạt động
}
