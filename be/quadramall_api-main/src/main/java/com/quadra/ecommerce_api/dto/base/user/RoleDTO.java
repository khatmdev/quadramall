package com.quadra.ecommerce_api.dto.base.user;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
