package com.quadra.ecommerce_api.dto.custom.order.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Thông tin trang đơn hàng, bao gồm địa chỉ mặc định và danh sách đơn hàng")
public class OrderPageResponse {
//    @Schema(description = "Địa chỉ giao hàng mặc định của người dùng")
//    private AddressDTO addressDefault;

    @Schema(description = "Danh sách các đơn hàng của người dùng")
    private List<OrderResponse> orderResponse;
}