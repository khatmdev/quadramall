package com.quadra.ecommerce_api.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "DTO for sending/receiving messages in real-time chat")
public class ChatMessageDTO {
    @Schema(description = "Unique ID of the message", example = "1")
    private Long id;

    @Schema(description = "ID of the conversation this message belongs to", example = "1")
    private Long conversationId;

    @Schema(description = "ID of the user sending the message", example = "123")
    private Long senderId;

    @Schema(description = "ID of the user or store receiving the message", example = "456")
    private Long receiverId;

    @Schema(description = "Text content of the message", example = "Xin chào")
    private String messageText;

    @Schema(description = "URL of the image attached to the message, if any", example = "http://example.com/image.jpg", nullable = true)
    private String imageUrl;

    @Schema(description = "URL of the video attached to the message, if any", example = "http://example.com/video.mp4", nullable = true)
    private String videoUrl;

    @Schema(description = "Timestamp when the message was created", example = "2025-07-21T16:30:00")
    private LocalDateTime createdAt;
}
