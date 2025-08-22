package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.quadra.ecommerce_api.enums.chatBot.MessageRole;
import com.quadra.ecommerce_api.enums.chatBot.MessageStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatMessageDto(
        String id,
        String sessionId,
        String conversationId,
        MessageRole role,
        String content,
        MessageStatus status,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp,

        List<ProductDto> products,
        Integer totalFound,
        Map<String, Object> metadata
) {
    @Builder
    public ChatMessageDto {}
}