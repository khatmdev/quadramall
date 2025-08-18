package com.quadra.ecommerce_api.dto.custom.order.response;

import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.dto.base.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.base.order.OrderItemDTO;
import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import com.quadra.ecommerce_api.dto.custom.cart.response.StoreDTO;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Thông tin trang đơn hàng, bao gồm địa chỉ mặc định và danh sách đơn hàng")
public class OrderPageResponse {
//    @Schema(description = "Địa chỉ giao hàng mặc định của người dùng")
//    private AddressDTO addressDefault;

    @Schema(description = "Danh sách các đơn hàng của người dùng")
    private List<OrderResponse> orderResponse;
}