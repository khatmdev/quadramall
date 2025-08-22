package com.quadra.ecommerce_api.dto.custom.chatBot;

public record TypingIndicatorDto(
        String sessionId,
        boolean isTyping,
        Long userId
) {}