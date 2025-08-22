package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ErrorResponseDto(
        String error,
        String message,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp,

        String path
) {}