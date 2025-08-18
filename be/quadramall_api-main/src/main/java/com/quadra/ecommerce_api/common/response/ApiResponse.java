package com.quadra.ecommerce_api.common.response;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Cấu trúc chuẩn phản hồi API của hệ thống")
public class ApiResponse<T> {

    @Schema(description = "Trạng thái phản hồi", example = "success")
    private String status;

    @Schema(description = "Thông điệp phản hồi", example = "Thành công")
    private String message;

    @Schema(description = "Dữ liệu phản hồi", nullable = true)
    private T data;

    @Schema(description = "Mã lỗi nếu có", nullable = true)
    private String errorCode;

    @Schema(description = "Thời điểm phản hồi (epoch millis)", example = "1720425600000")
    private long timestamp;


}