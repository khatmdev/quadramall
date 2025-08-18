package com.quadra.ecommerce_api.dto.custom.user.request;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class BehaviorRequest {
    private Long productId;
    private String behaviorType; // VIEW, LIKE, ADD_TO_CART, PURCHASE
}
