package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;
@Builder
public record HealthCheckDto(
        String status,
        Map<String, Object> details,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp
) {}
