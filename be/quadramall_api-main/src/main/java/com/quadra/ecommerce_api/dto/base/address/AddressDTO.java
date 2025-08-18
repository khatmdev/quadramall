package com.quadra.ecommerce_api.dto.base.address;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin địa chỉ giao hàng")
public class AddressDTO {
    @Schema(description = "Mã định danh duy nhất của địa chỉ", example = "1")
    private Long id;

    @Schema(description = "Tên người nhận hàng", example = "Nguyễn Văn A")
    private String receiverName;

    @Schema(description = "Số điện thoại của người nhận", example = "0901234567")
    private String receiverPhone;

    @Schema(description = "Địa chỉ chi tiết (số nhà, tên đường)", example = "123 Đường Láng Hạ")
    private String detailAddress;

    @Schema(description = "Tên phường/xã", example = "Phường Láng Hạ")
    private String ward;

    @Schema(description = "Tên quận/huyện", example = "Quận Đống Đa")
    private String district;

    @Schema(description = "Tên tỉnh/thành phố", example = "Hà Nội")
    private String city;

    @Schema(description = "Mã tỉnh/thành phố", example = "01")
    private String cityCode;

    @Schema(description = "Mã phường/xã", example = "001")
    private String wardCode;

    @Schema(description = "Mã quận/huyện", example = "006")
    private String districtCode;

    @Schema(description = "Trạng thái địa chỉ mặc định", example = "true")
    private boolean isDefault;
}