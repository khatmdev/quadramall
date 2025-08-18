package com.quadra.ecommerce_api.dto.custom.profile.response;

import lombok.Data;

@Data
public class ProfileResponse {
    private String fullName;
    private String phone;
    private String avatarUrl;

    public ProfileResponse(String fullName, String phone, String avatarUrl) {
    }
}
