package com.quadra.ecommerce_api.dto.custom.auth.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private String message;
    private boolean isOk;
}
