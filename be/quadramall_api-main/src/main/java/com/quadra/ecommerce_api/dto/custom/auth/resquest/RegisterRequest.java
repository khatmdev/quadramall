package com.quadra.ecommerce_api.dto.custom.auth.resquest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;


@Data
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu bắt buộc phải nhập")
    @Size(min = 6, max = 24, message = "Mật khẩu phải có 6 - 24 ký tự ")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

}
