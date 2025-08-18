package com.quadra.ecommerce_api.common.cms;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@Schema(description = "Phản hồi kiểu Void")
public class ApiResponseVoid {

    @Schema(example = "success", description = "Trạng thái phản hồi")
    private String status;

    @Schema(example = "Thành công", description = "Thông điệp phản hồi")
    private String message;

    @Schema(nullable = true, description = "Dữ liệu phản hồi", example = "null")
    private Object data;

    @Schema(nullable = true, description = "Mã lỗi nếu có", example = "null")
    private String errorCode;

    @Schema(description = "Thời điểm phản hồi (milliseconds)", example = "1720425600000")
    private long timestamp;
}
