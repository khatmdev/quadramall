package com.quadra.ecommerce_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "DTO để gửi và nhận thông báo liên quan đến chat hoặc các sự kiện khác")
public class NotificationDTO {
    @Schema(description = "ID duy nhất của thông báo", example = "1")
    private Long id;

    @Schema(description = "ID của người dùng nhận thông báo, nếu có", example = "123", nullable = true)
    private Long userId;

    @Schema(description = "ID của cửa hàng nhận thông báo, nếu có", example = "456", nullable = true)
    private Long storeId;

    @Schema(description = "Nội dung của thông báo", example = "Tin nhắn mới từ user 123")
    private String content;

    @Schema(description = "Loại thông báo (ví dụ: 'message', 'order')", example = "message")
    private String type;

    @Schema(description = "Thời điểm thông báo được tạo", example = "2025-07-21T16:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Trạng thái đã đọc của thông báo", example = "false")
    private boolean isRead;
}
