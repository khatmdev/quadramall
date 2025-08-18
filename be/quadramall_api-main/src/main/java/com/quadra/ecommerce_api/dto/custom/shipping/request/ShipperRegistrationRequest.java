package com.quadra.ecommerce_api.dto.custom.shipping.request;

import com.quadra.ecommerce_api.enums.shipping.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ShipperRegistrationRequest {
    @NotNull(message = "Loại phương tiện không được để trống")
    private VehicleType vehicleType;

    private String licensePlate;

    @NotBlank(message = "Số CMND/CCCD không được để trống")
    private String idCardNumber;

    @NotBlank(message = "Ảnh mặt trước CMND/CCCD không được để trống")
    private String idCardFrontUrl;

    @NotBlank(message = "Ảnh mặt sau CMND/CCCD không được để trống")
    private String idCardBackUrl;

    private String driverLicenseUrl;
    private String vehicleRegistrationUrl;


}
