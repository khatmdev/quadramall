package com.quadra.ecommerce_api.dto.buyer.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationUpdateRequestDto {

    @NotBlank(message = "Tên cửa hàng không được để trống")
    @Size(min = 2, max = 100, message = "Tên cửa hàng phải từ 2 đến 100 ký tự")
    private String storeName;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;

    @Size(min = 10, max = 13, message = "Mã số thuế phải từ 10 đến 13 ký tự")
    private String taxCode;

    private String logoUrl;

    private String businessLicenseUrl;

    private List<String> idCardUrl;
}
