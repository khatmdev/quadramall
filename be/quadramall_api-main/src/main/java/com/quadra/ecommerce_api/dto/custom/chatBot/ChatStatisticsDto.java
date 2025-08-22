package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.LocalDateTime;

public record ChatStatisticsDto(
        Long totalSessions,
        Long activeSessions,
        Long totalMessages,
        Double averageResponseTime,
        Long connectedUsers,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp
) {
    @Builder
    public ChatStatisticsDto {}
}