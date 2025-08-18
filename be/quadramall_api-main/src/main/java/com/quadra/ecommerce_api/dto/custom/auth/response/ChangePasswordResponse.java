package com.quadra.ecommerce_api.dto.custom.auth.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class ChangePasswordResponse {
    private String message;
    private int  status;
}
