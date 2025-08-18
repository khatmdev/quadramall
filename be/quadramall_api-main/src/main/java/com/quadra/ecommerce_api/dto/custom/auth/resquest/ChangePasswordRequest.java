package com.quadra.ecommerce_api.dto.custom.auth.resquest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChangePasswordRequest {

    private String oldPassword;
    private String newPassword;

}
