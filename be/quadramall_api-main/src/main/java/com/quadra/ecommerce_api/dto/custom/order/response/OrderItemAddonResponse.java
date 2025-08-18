package com.quadra.ecommerce_api.dto.custom.order.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemAddonResponse {

    private String id;
    private String addonGroupName;
    private String addonName;
    private BigDecimal priceAdjust;
}
