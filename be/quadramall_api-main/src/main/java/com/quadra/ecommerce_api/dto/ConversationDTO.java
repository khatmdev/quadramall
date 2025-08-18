package com.quadra.ecommerce_api.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "DTO để biểu diễn cuộc trò chuyện giữa khách hàng và cửa hàng")
public class ConversationDTO {
    @Schema(description = "ID duy nhất của cuộc trò chuyện", example = "1")
    private Long id;

    @Schema(description = "ID của khách hàng tham gia cuộc trò chuyện", example = "123")
    private Long customerId;

    @Schema(description = "ID của cửa hàng tham gia cuộc trò chuyện", example = "456")
    private Long storeId;

    @Schema(description = "Thời điểm cuộc trò chuyện được tạo", example = "2025-07-21T16:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời điểm cuộc trò chuyện được cập nhật lần cuối", example = "2025-07-21T16:30:00")
    private LocalDateTime updatedAt;
}
