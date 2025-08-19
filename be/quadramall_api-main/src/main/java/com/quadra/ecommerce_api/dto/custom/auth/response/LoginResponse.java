package com.quadra.ecommerce_api.dto.custom.auth.response;

import com.quadra.ecommerce_api.dto.base.user.RoleDTO;
import com.quadra.ecommerce_api.entity.user.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private String refreshToken;
    private String provider;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Set<RoleDTO> roles;
    private List<Long> storeIds; // Thêm trường này
    private Long userId;


}
