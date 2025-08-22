package com.quadra.ecommerce_api.dto.custom.chatBot;

import jakarta.validation.constraints.NotBlank;

public record QuickChatRequestDto(
        @NotBlank(message = "Message cannot be empty")
        String message
) {}