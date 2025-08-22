package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StreamChunkDto(
        String type,
        String content,
        Object data,
        String sessionId,
        String conversationId
) {
    @Builder
    public StreamChunkDto {}
}