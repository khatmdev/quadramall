package com.quadra.ecommerce_api.dto.custom.orderManagerment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInfoResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
}