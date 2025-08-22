package com.quadra.ecommerce_api.dto.custom.chatBot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Request DTOs
public record ChatRequestDto(
        @NotBlank(message = "Message cannot be empty")
        @Size(max = 1000, message = "Message too long")
        String message,

        String sessionId,
        String conversationId,
        boolean stream
) {}