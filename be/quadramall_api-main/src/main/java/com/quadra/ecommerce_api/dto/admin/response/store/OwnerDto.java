package com.quadra.ecommerce_api.dto.admin.response.store;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO chứa thông tin cơ bản của chủ cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDto {

    @Schema(description = "ID của chủ cửa hàng", example = "1")
    private Long ownerId;

    @Schema(description = "Họ tên chủ cửa hàng", example = "John Doe")
    private String fullName;

    @Schema(description = "Email chủ cửa hàng", example = "john@example.com")
    private String email;

    @Schema(description = "Số điện thoại chủ cửa hàng", example = "123-456-7890")
    private String phone;
}
