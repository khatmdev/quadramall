package com.quadra.ecommerce_api.dto.custom.address.request;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import lombok.Data;

@Data
public class AddAddress {

    private String receiverName;
    private String receiverPhone;
    private String detailAddress;

    private String ward;
    private String wardCode;

    private String district;
    private String districtCode;

    private String city;
    private String cityCode;

    private Boolean isDefault;
}
