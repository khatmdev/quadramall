package com.quadra.ecommerce_api.dto.custom.profile.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileRequest {
    private String fullName;
    private String phone;
    private MultipartFile avatar;

}
