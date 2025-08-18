package com.quadra.ecommerce_api.dto.custom.orderManagerment.request;

import com.quadra.ecommerce_api.enums.order.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request để cập nhật trạng thái đơn hàng")
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    @Schema(description = "Trạng thái mới của đơn hàng", required = true, example = "PROCESSING")
    private OrderStatus status;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú khi cập nhật trạng thái", example = "Đã xác nhận đơn hàng và bắt đầu chuẩn bị")
    private String note;

    @Schema(description = "Danh sách ID đơn hàng (dùng cho batch update)",
            example = "[1, 2, 3]")
    private List<Long> orderIds;
}