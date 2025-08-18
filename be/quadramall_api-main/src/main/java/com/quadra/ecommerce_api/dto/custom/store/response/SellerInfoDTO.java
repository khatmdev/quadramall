package com.quadra.ecommerce_api.dto.custom.store.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerInfoDTO {
    private Long id;
    private String name;
    private String province;
    private String slug;
}
