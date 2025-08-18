package com.quadra.ecommerce_api.controller.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO để từ chối yêu cầu đăng ký cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectSellerRegistrationRequestDto {
    @Schema(description = "Lý do từ chối yêu cầu đăng ký", example = "Giấy phép kinh doanh không hợp lệ", required = true)
    @NotBlank(message = "Lý do từ chối là bắt buộc")
    @Size(max = 255, message = "Lý do từ chối không được vượt quá 255 ký tự")
    private String rejectionReason;
}
