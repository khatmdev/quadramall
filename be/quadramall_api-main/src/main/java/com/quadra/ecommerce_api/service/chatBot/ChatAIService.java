package com.quadra.ecommerce_api.service.chatBot;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.config.websocket.ChatBotConfig;
import com.quadra.ecommerce_api.dto.custom.chatBot.ChatRequestDto;
import com.quadra.ecommerce_api.dto.custom.chatBot.ChatResponseDto;
import com.quadra.ecommerce_api.dto.custom.chatBot.ProductDto;
import com.quadra.ecommerce_api.dto.custom.chatBot.StreamChunkDto;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatAIService {

    private final WebClient chatAiWebClient;
    private final ChatBotConfig chatBotConfig;
    private final ObjectMapper objectMapper;

    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public Mono<ChatResponseDto> sendMessage(ChatRequestDto request, Long userId, String sessionId) {
        log.debug("Sending message to AI service - userId: {}, sessionId: {}", userId, sessionId);

        var aiRequest = createAIRequest(request, userId, sessionId, false);

        return chatAiWebClient
                .post()
                .uri("/api/v1/chat/ask")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new ResourceNotFound("AI Service Error: " + body))
                )
                .bodyToMono(Map.class)
                .map(this::mapToResponse)
                .timeout(Duration.ofSeconds(chatBotConfig.getAiService().getTimeout()))
                .retryWhen(Retry.backoff(3, Duration.ofMillis(1000)))
                .doOnSuccess(response -> log.debug("AI response received: conversationId={}", response.conversationId()))
                .doOnError(error -> log.error("AI service error: {}", error.getMessage()));
    }

    public Flux<StreamChunkDto> sendMessageStream(ChatRequestDto request, Long userId, String sessionId) {
        log.debug("Sending streaming message to AI service - userId: {}, sessionId: {}", userId, sessionId);

        var aiRequest = createAIRequest(request, userId, sessionId, true);

        return chatAiWebClient
                .post()
                .uri("/api/v1/chat/ask/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new ResourceNotFound("AI Streaming Error: " + body))
                )
                .bodyToFlux(String.class)
                .filter(line -> line.startsWith("data: "))
                .map(line -> line.substring(6)) // Remove "data: " prefix
                .filter(data -> !data.trim().isEmpty() && !data.equals("[DONE]"))
                .map(this::parseStreamChunk)
                .timeout(Duration.ofSeconds(chatBotConfig.getAiService().getTimeout() * 2))
                .doOnNext(chunk -> log.trace("Stream chunk received: type={}", chunk.type()))
                .doOnError(error -> log.error("AI streaming error: {}", error.getMessage()))
                .doOnComplete(() -> log.debug("AI streaming completed"));
    }

    public Mono<Map> getConversationHistory(String conversationId) {
        return chatAiWebClient
                .get()
                .uri("/api/v1/chat/conversation/{conversationId}", conversationId)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(chatBotConfig.getAiService().getTimeout()))
                .doOnError(error -> log.error("Error fetching conversation history: {}", error.getMessage()));
    }

    public Mono<Void> deleteConversation(String conversationId) {
        return chatAiWebClient
                .delete()
                .uri("/api/v1/chat/conversation/{conversationId}", conversationId)
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(chatBotConfig.getAiService().getTimeout()))
                .doOnError(error -> log.error("Error deleting conversation: {}", error.getMessage()));
    }

    public Mono<Map> getAIServiceHealth() {
        return chatAiWebClient
                .get()
                .uri("/health")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .onErrorReturn(Map.of("status", "unhealthy"));
    }

    private Map<String, Object> createAIRequest(ChatRequestDto request, Long userId, String sessionId, boolean stream) {
        return Map.of(
                "message", request.message(),
                "user_id", userId.toString(),
                "session_id", sessionId != null ? sessionId : "",
                "conversation_id", request.conversationId() != null ? request.conversationId() : "",
                "stream", stream
        );
    }

    private ChatResponseDto mapToResponse(Map<String, Object> aiResponse) {
        try {
            var builder = ChatResponseDto.builder()
                    .messageId((String) aiResponse.get("message_id"))
                    .conversationId((String) aiResponse.get("conversation_id"))
                    .message((String) aiResponse.get("message"))
                    .conversationType((String) aiResponse.get("conversation_type"))
                    .hasContext((Boolean) aiResponse.get("has_context"))
                    .totalFound((Integer) aiResponse.get("total_found"))
                    .searchType((String) aiResponse.get("search_type"))
                    .confidence((Double) aiResponse.get("confidence"))
                    .timestamp(LocalDateTime.now());

            // Map products if present
            if (aiResponse.get("products") instanceof List<?> products) {
                var productDtos = products.stream()
                        .filter(Map.class::isInstance)
                        .map(Map.class::cast)
                        .map(this::mapToProductDto)
                        .toList();
                builder.products(productDtos);
            }

            return builder.build();

        } catch (Exception e) {
            log.error("Error mapping AI response: {}", e.getMessage());
            throw new ResourceNotFound("Failed to process AI response");
        }
    }

    private ProductDto mapToProductDto(Map<String, Object> product) {
        try {
            // ✅ DEBUG: Log individual product để xem keys available
            log.info("🔍 Product keys: {}", product.keySet());

            // ✅ Thử multiple fields cho URL
            String url = getStringValue(product, "url");
            if (url == null) url = getStringValue(product, "product_url");
            if (url == null) url = getStringValue(product, "link");
            if (url == null) url = getStringValue(product, "href");

            return ProductDto.builder()
                    .id(getLongValue(product, "id"))
                    .name(getStringValue(product, "name"))
                    .description(getStringValue(product, "description"))
                    .category(getStringValue(product, "category"))
                    .store(getStringValue(product, "store"))
                    .minPrice(getBigDecimalValue(product, "min_price"))
                    .maxPrice(getBigDecimalValue(product, "max_price"))
                    .totalStock(getIntegerValue(product, "total_stock"))
                    .thumbnailUrl(getStringValue(product, "thumbnail_url"))
                    .url(url)  // ✅ Now properly mapped
                    .similarityScore(getDoubleValue(product, "similarity_score"))
                    .rank(getIntegerValue(product, "rank"))
                    .build();
        } catch (Exception e) {
            log.warn("Error mapping product: {}", e.getMessage(), e);
            return ProductDto.builder()
                    .id(0L)
                    .name("Unknown Product")
                    .build();
        }
    }

    // ✅ Helper method cho String values
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private StreamChunkDto parseStreamChunk(String data) {
        try {
            Map<String, Object> chunkData = objectMapper.readValue(data, new TypeReference<>() {});

            return StreamChunkDto.builder()
                    .type((String) chunkData.get("type"))
                    .content((String) chunkData.get("content"))
                    .data(chunkData.get("data"))
                    .sessionId((String) chunkData.get("sessionId"))
                    .conversationId((String) chunkData.get("conversationId"))
                    .build();

        } catch (Exception e) {
            log.error("Error parsing stream chunk: {}", data, e);
            return StreamChunkDto.builder()
                    .type("error")
                    .content("Failed to parse stream data")
                    .build();
        }
    }

    // Utility methods for safe type conversion
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    private Integer getIntegerValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private Double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return null;
    }

    private BigDecimal getBigDecimalValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return null;
    }
}