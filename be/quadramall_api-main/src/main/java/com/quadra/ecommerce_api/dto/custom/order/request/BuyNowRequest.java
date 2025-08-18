package com.quadra.ecommerce_api.dto.custom.order.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyNowRequest {
    private Long productVariantId;
    private Integer quantity;
    private List<Long> addonIds; // Optional: danh sách addon IDs
}
