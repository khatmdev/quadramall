package com.quadra.ecommerce_api.controller.chatBot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.dto.custom.chatBot.*;
import com.quadra.ecommerce_api.service.chatBot.ChatBotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "ChatBot", description = "AI ChatBot API with real-time messaging")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatBotController {

    private final ChatBotService chatBotService;
    private final ObjectMapper objectMapper;

    // ✅ CRITICAL FIX: Inject custom executor
    @Qualifier("chatBotStreamingExecutor")
    private final ThreadPoolTaskExecutor chatBotStreamingExecutor;

    @PostMapping("/send")
    @Operation(summary = "Send message to ChatBot", description = "Send a message and get AI response")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Message sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public CompletableFuture<ResponseEntity<ChatResponseDto>> sendMessage(
            @Valid @RequestBody ChatRequestDto request,
            @AuthenticationPrincipal com.quadra.ecommerce_api.entity.user.User user) {

        Long userId = user.getId();
        log.info("Received chat request from user: {}", userId);

        // Validate request
        if (request.message() == null || request.message().trim().isEmpty()) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().build()
            );
        }

        if (request.message().length() > 4000) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().build()
            );
        }

        // ✅ Use custom executor for async processing
        return CompletableFuture
                .supplyAsync(() -> {
                    try {
                        return chatBotService.processMessage(request, userId).join();
                    } catch (Exception e) {
                        log.error("Error processing message for user {}: {}", userId, e.getMessage());
                        throw new RuntimeException(e);
                    }
                }, chatBotStreamingExecutor)
                .thenApply(ResponseEntity::ok)
                .exceptionally(throwable -> {
                    log.error("Error processing message for user {}: {}", userId, throwable.getMessage());

                    if (throwable.getCause() instanceof IllegalArgumentException) {
                        return ResponseEntity.badRequest().build();
                    } else if (throwable.getMessage() != null && throwable.getMessage().contains("rate limit")) {
                        return ResponseEntity.status(429).build();
                    } else {
                        return ResponseEntity.internalServerError().build();
                    }
                });
    }

    @PostMapping(value = "/send-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Send message with streaming response", description = "Send a message and get streaming AI response")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Streaming response started"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Flux<String> sendMessageStream(
            @Valid @RequestBody ChatRequestDto request,
            @Parameter(hidden = true) @AuthenticationPrincipal com.quadra.ecommerce_api.entity.user.User user) {

        Long userId = user.getId();
        log.info("Received streaming chat request from user: {}", userId);

        // Validate request
        if (request.message() == null || request.message().trim().isEmpty()) {
            return Flux.just("data: " + toJson(createErrorChunk("Message cannot be empty")) + "\n\n");
        }

        if (request.message().length() > 4000) {
            return Flux.just("data: " + toJson(createErrorChunk("Message too long")) + "\n\n");
        }

        return chatBotService.processMessageStream(request, userId)
                .map(chunk -> "data: " + toJson(chunk) + "\n\n")
                .onErrorResume(error -> {
                    log.error("Streaming error for user {}: {}", userId, error.getMessage());
                    var errorChunk = createErrorChunk("Processing error: " + error.getMessage());
                    return Flux.just("data: " + toJson(errorChunk) + "\n\n");
                })
                .timeout(Duration.ofMinutes(2))
                .doOnSubscribe(subscription ->
                        log.info("Started streaming for user: {}", userId))
                .doOnComplete(() ->
                        log.info("Completed streaming for user: {}", userId))
                .doOnCancel(() ->
                        log.info("Streaming cancelled for user: {}", userId));
    }

    /**
     * ✅ Alternative async endpoint using DeferredResult (better for some use cases)
     */
    @PostMapping("/send-async")
    @Operation(summary = "Send message asynchronously", description = "Send a message and get async AI response")
    public DeferredResult<ResponseEntity<ChatResponseDto>> sendMessageAsync(
            @Valid @RequestBody ChatRequestDto request,
            @AuthenticationPrincipal com.quadra.ecommerce_api.entity.user.User user) {

        Long userId = user.getId();
        log.info("Received async chat request from user: {}", userId);

        // ✅ Create DeferredResult with timeout
        DeferredResult<ResponseEntity<ChatResponseDto>> deferredResult =
                new DeferredResult<>(60000L); // 60 second timeout

        // ✅ Handle timeout
        deferredResult.onTimeout(() -> {
            log.warn("Request timeout for user: {}", userId);
            deferredResult.setResult(ResponseEntity.status(408).build());
        });

        // ✅ Process asynchronously using custom executor
        chatBotStreamingExecutor.submit(() -> {
            try {
                ChatResponseDto response = chatBotService.processMessage(request, userId).join();
                deferredResult.setResult(ResponseEntity.ok(response));
            } catch (Exception e) {
                log.error("Async processing error for user {}: {}", userId, e.getMessage());
                deferredResult.setErrorResult(ResponseEntity.internalServerError().build());
            }
        });

        return deferredResult;
    }

    // ✅ Rest of the controller methods remain the same...
    @PostMapping("/quick")
    @Operation(summary = "Quick chat", description = "Send a quick message without session management")
    public CompletableFuture<ResponseEntity<ChatResponseDto>> quickChat(
            @Valid @RequestBody QuickChatRequestDto request,
            @Parameter(hidden = true) @AuthenticationPrincipal com.quadra.ecommerce_api.entity.user.User user) {

        Long userId = user.getId();
        log.info("Received quick chat from user: {}", userId);

        if (request.message() == null || request.message().trim().isEmpty()) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().build());
        }

        return chatBotService.quickChat(request, userId)
                .thenApply(ResponseEntity::ok)
                .exceptionally(throwable -> {
                    log.error("Error in quick chat for user {}: {}", userId, throwable.getMessage());
                    return ResponseEntity.internalServerError().build();
                });
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get user sessions", description = "Get list of user's chat sessions")
    public ResponseEntity<List<ChatSessionDto>> getUserSessions(
            @PageableDefault(size = 20) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal com.quadra.ecommerce_api.entity.user.User user) {

        Long userId = user.getId();
        log.debug("Getting sessions for user: {}", userId);

        try {
            var sessions = chatBotService.getUserSessions(userId, pageable);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error getting sessions for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check ChatBot service health")
    public ResponseEntity<HealthCheckDto> healthCheck() {
        try {
            var health = HealthCheckDto.builder()
                    .status("healthy")
                    .details(Map.of(
                            "service", "ChatBot",
                            "version", "2.0.0",
                            "status", "operational",
                            "timestamp", LocalDateTime.now().toString(),
                            "executor", "custom-configured",
                            "activeThreads", chatBotStreamingExecutor.getActiveCount(),
                            "poolSize", chatBotStreamingExecutor.getPoolSize()
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage());
            var health = HealthCheckDto.builder()
                    .status("unhealthy")
                    .details(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now().toString()
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.status(503).body(health);
        }
    }

    // ✅ Utility methods
    private StreamChunkDto createErrorChunk(String message) {
        return StreamChunkDto.builder()
                .type("error")
                .content(message)
                .build();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("JSON conversion failed for object: {}", obj.getClass().getSimpleName());
            return String.format("{\"type\":\"error\",\"content\":\"JSON conversion failed\",\"timestamp\":\"%s\"}",
                    LocalDateTime.now());
        }
    }
}