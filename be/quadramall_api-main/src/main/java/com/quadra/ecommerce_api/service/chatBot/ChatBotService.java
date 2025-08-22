package com.quadra.ecommerce_api.service.chatBot;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.config.websocket.ChatBotConfig;
import com.quadra.ecommerce_api.dto.custom.chatBot.*;
import com.quadra.ecommerce_api.entity.chatBot.ChatMessage;
import com.quadra.ecommerce_api.entity.chatBot.ChatSession;
import com.quadra.ecommerce_api.enums.chatBot.*;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.repository.chatBot.ChatMessageRepository;
import com.quadra.ecommerce_api.repository.chatBot.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatBotService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatAIService chatAIService;
    private final WebSocketService webSocketService;
    private final ChatBotConfig chatBotConfig;
    private final ObjectMapper objectMapper;

    /**
     * Process chat message synchronously
     * Returns CompletableFuture for async handling at controller level
     */
    @Async("chatBotTaskExecutor")
    public CompletableFuture<ChatResponseDto> processMessage(ChatRequestDto request, Long userId) {
        log.info("Processing chat message for user: {}", userId);

        try {
            // Get or create session
            ChatSession session = getOrCreateSession(request, userId);

            // Save user message
            ChatMessage userMessage = saveUserMessage(session, request.message(), userId);

            // Send to AI service and get response
            ChatResponseDto aiResponse = chatAIService.sendMessage(request, userId, session.getSessionId())
                    .block(); // Block here since we're in async method
            System.out.println("AI RESPONSE: " + aiResponse);

            if (aiResponse == null) {
                throw new RuntimeException("AI service returned null response");
            }

            // Save AI response
            ChatMessage assistantMessage = saveAssistantMessage(session, aiResponse, userId);

            // Update session
            updateSessionFromResponse(session, aiResponse);

            // Build final response
            ChatResponseDto response = buildChatResponse(assistantMessage, aiResponse, session);
            System.out.println("Check Response"+response);

            log.info("Chat message processed successfully: {}", response.messageId());
            return CompletableFuture.completedFuture(response);

        } catch (Exception error) {
            log.error("Error processing message for user {}: {}", userId, error.getMessage(), error);

            // Try to save error message
            try {
                ChatSession session = getOrCreateSession(request, userId);
                saveErrorMessage(session, error.getMessage(), userId);
            } catch (Exception e) {
                log.error("Failed to save error message: {}", e.getMessage());
            }

            return CompletableFuture.failedFuture(
                    new ResourceNotFound("Failed to process chat message: " + error.getMessage())
            );
        }
    }

    /**
     * Process streaming message
     * Uses reactive streams only for the streaming part
     */
    public Flux<StreamChunkDto> processMessageStream(ChatRequestDto request, Long userId) {
        log.info("Processing streaming chat message for user: {}", userId);

        return Mono.fromCallable(() -> {
                    // Save user message synchronously at start
                    ChatSession session = getOrCreateSession(request, userId);
                    saveUserMessage(session, request.message(), userId);
                    return session;
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(session -> {
                    StringBuilder fullResponse = new StringBuilder();

                    return chatAIService.sendMessageStream(request, userId, session.getSessionId())
                            .map(chunk -> {
                                // Enhance chunk with session info
                                var enhancedChunk = StreamChunkDto.builder()
                                        .type(chunk.type())
                                        .content(chunk.content())
                                        .data(chunk.data())
                                        .sessionId(session.getSessionId())
                                        .conversationId(session.getConversationId())
                                        .build();

                                // Accumulate content
                                if ("content".equals(chunk.type()) && chunk.content() != null) {
                                    fullResponse.append(chunk.content());
                                }

                                // Send to WebSocket
                                try {
                                    webSocketService.sendToUser(userId, enhancedChunk);
                                } catch (Exception e) {
                                    log.warn("Failed to send WebSocket message: {}", e.getMessage());
                                }

                                return enhancedChunk;
                            })
                            .doOnComplete(() -> {
                                // Save complete response asynchronously
                                CompletableFuture.runAsync(() -> {
                                    try {
                                        if (fullResponse.length() > 0) {
                                            var aiResponse = ChatResponseDto.builder()
                                                    .message(fullResponse.toString())
                                                    .conversationId(session.getConversationId())
                                                    .timestamp(LocalDateTime.now())
                                                    .build();

                                            saveAssistantMessage(session, aiResponse, userId);
                                            updateSessionActivity(session);
                                        }
                                    } catch (Exception e) {
                                        log.error("Error saving streaming response: {}", e.getMessage());
                                    }
                                });
                            });
                })
                .doOnError(error ->
                        log.error("Error in streaming chat for user {}: {}", userId, error.getMessage())
                );
    }

    /**
     * Quick chat - simplified version
     */
    @Async("chatBotTaskExecutor")
    public CompletableFuture<ChatResponseDto> quickChat(QuickChatRequestDto request, Long userId) {
        log.info("Processing quick chat for user: {}", userId);

        var chatRequest = new ChatRequestDto(request.message(), null, null, false);
        return processMessage(chatRequest, userId);
    }

    // Synchronous helper methods
    private ChatSession getOrCreateSession(ChatRequestDto request, Long userId) {
        // Try to find existing session
        if (request.sessionId() != null) {
            Optional<ChatSession> existing = sessionRepository.findBySessionId(request.sessionId());
            if (existing.isPresent() && existing.get().getUserId().equals(userId)) {
                ChatSession session = existing.get();
                session.setLastActivity(LocalDateTime.now());
                return sessionRepository.save(session);
            }
        }

        // Create new session
        ChatSession session = ChatSession.builder()
                .sessionId(request.sessionId() != null ? request.sessionId() : UUID.randomUUID().toString())
                .conversationId(request.conversationId())
                .userId(userId)
                .status(SessionStatus.ACTIVE)
                .messageCount(0)
                .build();

        return sessionRepository.save(session);
    }

    private ChatMessage saveUserMessage(ChatSession session, String content, Long userId) {
        ChatMessage message = ChatMessage.builder()
                .messageId(UUID.randomUUID().toString())
                .session(session)
                .userId(userId)
                .role(MessageRole.USER)
                .content(content)
                .status(MessageStatus.SENT)
                .build();

        ChatMessage saved = messageRepository.save(message);
        session.incrementMessageCount();
        sessionRepository.save(session);

        return saved;
    }

    private ChatMessage saveAssistantMessage(ChatSession session, ChatResponseDto aiResponse, Long userId) {
        ChatMessage message = ChatMessage.builder()
                .messageId(aiResponse.messageId() != null ? aiResponse.messageId() : UUID.randomUUID().toString())
                .session(session)
                .userId(userId)
                .role(MessageRole.ASSISTANT)
                .content(aiResponse.message())
                .status(MessageStatus.DELIVERED)
                .confidenceScore(aiResponse.confidence())
                .productsCount(aiResponse.products() != null ? aiResponse.products().size() : 0)
                .build();

        // Store metadata as JSON
        if (aiResponse.products() != null && !aiResponse.products().isEmpty()) {
            try {
                Map<String, Object> metadata = Map.of(
                        "products_count", aiResponse.totalFound() != null ? aiResponse.totalFound() : 0,
                        "search_type", aiResponse.searchType() != null ? aiResponse.searchType() : "unknown",
                        "conversation_type", aiResponse.conversationType() != null ? aiResponse.conversationType() : "general"
                );
                message.setMetadata(objectMapper.writeValueAsString(metadata));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize message metadata: {}", e.getMessage());
            }
        }

        ChatMessage saved = messageRepository.save(message);
        session.incrementMessageCount();
        sessionRepository.save(session);

        return saved;
    }

    private void saveErrorMessage(ChatSession session, String errorMessage, Long userId) {
        ChatMessage message = ChatMessage.builder()
                .messageId(UUID.randomUUID().toString())
                .session(session)
                .userId(userId)
                .role(MessageRole.SYSTEM)
                .content("Error: " + errorMessage)
                .status(MessageStatus.ERROR)
                .build();

        messageRepository.save(message);
        session.incrementMessageCount();
        sessionRepository.save(session);
    }

    private void updateSessionFromResponse(ChatSession session, ChatResponseDto aiResponse) {
        if (aiResponse.conversationId() != null) {
            session.setConversationId(aiResponse.conversationId());
        }
        if (aiResponse.conversationType() != null) {
            session.setConversationType(aiResponse.conversationType());
        }
        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);
    }

    private void updateSessionActivity(ChatSession session) {
        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);
    }

    // All other methods remain the same...
    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserSessions(Long userId, Pageable pageable) {
        Page<ChatSession> sessions = sessionRepository.findByUserIdOrderByLastActivityDesc(userId, pageable);
        return sessions.getContent().stream()
                .map(this::mapToSessionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ChatSessionDto> getSessionById(String sessionId) {
        return sessionRepository.findBySessionId(sessionId)
                .map(this::mapToSessionDto);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getSessionMessages(String sessionId, Pageable pageable) {
        Page<ChatMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, pageable);
        return messages.map(this::mapToMessageDto);
    }

    public void closeSession(String sessionId, Long userId) {
        sessionRepository.findBySessionId(sessionId)
                .ifPresent(session -> {
                    if (session.getUserId().equals(userId)) {
                        session.setStatus(SessionStatus.CLOSED);
                        sessionRepository.save(session);
                        log.info("Session closed: {} by user: {}", sessionId, userId);

                        try {
                            webSocketService.sendSessionClosed(userId, sessionId);
                        } catch (Exception e) {
                            log.warn("Failed to send session closed notification: {}", e.getMessage());
                        }
                    }
                });
    }

    @Async("chatBotTaskExecutor")
    public CompletableFuture<Void> cleanupExpiredSessions() {
        log.info("Starting cleanup of expired sessions");

        try {
            var cutoffTime = LocalDateTime.now().minusHours(chatBotConfig.getSession().getSessionTimeoutHours());

            int updatedCount = sessionRepository.updateExpiredSessions(
                    cutoffTime, SessionStatus.ACTIVE, SessionStatus.INACTIVE);

            var deleteCutoffTime = LocalDateTime.now().minusDays(30);
            int deletedCount = sessionRepository.deleteOldSessions(deleteCutoffTime, SessionStatus.INACTIVE);

            log.info("Session cleanup completed - Updated: {}, Deleted: {}", updatedCount, deletedCount);

        } catch (Exception e) {
            log.error("Error during session cleanup: {}", e.getMessage(), e);
        }

        return CompletableFuture.completedFuture(null);
    }

    public ChatStatisticsDto getChatStatistics() {
        try {
            var now = LocalDateTime.now();

            return ChatStatisticsDto.builder()
                    .totalSessions(sessionRepository.count())
                    .activeSessions(sessionRepository.countByStatus(SessionStatus.ACTIVE))
                    .totalMessages(messageRepository.count())
                    .averageResponseTime(messageRepository.getAverageResponseTime())
                    .connectedUsers(webSocketService.getConnectedUsersCount())
                    .timestamp(now)
                    .build();

        } catch (Exception e) {
            log.error("Error getting chat statistics: {}", e.getMessage());
            return ChatStatisticsDto.builder()
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    // Helper mapping methods remain the same...
    private ChatResponseDto buildChatResponse(ChatMessage assistantMessage, ChatResponseDto aiResponse, ChatSession session) {
        return ChatResponseDto.builder()
                .messageId(assistantMessage.getMessageId())
                .sessionId(session.getSessionId())
                .conversationId(session.getConversationId())
                .message(assistantMessage.getContent())
                .role(MessageRole.ASSISTANT)
                .timestamp(assistantMessage.getCreatedAt())
                .status(assistantMessage.getStatus())
                .products(aiResponse.products())
                .totalFound(aiResponse.totalFound())
                .conversationType(aiResponse.conversationType())
                .hasContext(aiResponse.hasContext())
                .searchType(aiResponse.searchType())
                .confidence(aiResponse.confidence())
                .metadata(aiResponse.metadata())
                .build();
    }

    private ChatSessionDto mapToSessionDto(ChatSession entity) {
        String lastMessagePreview = null;
        if (!entity.getMessages().isEmpty()) {
            var lastMessage = entity.getMessages().get(entity.getMessages().size() - 1);
            lastMessagePreview = lastMessage.getContent().length() > 100
                    ? lastMessage.getContent().substring(0, 100) + "..."
                    : lastMessage.getContent();
        }

        return ChatSessionDto.builder()
                .sessionId(entity.getSessionId())
                .conversationId(entity.getConversationId())
                .userId(entity.getUserId())
                .status(entity.getStatus().getValue())
                .createdAt(entity.getCreatedAt())
                .lastActivity(entity.getLastActivity())
                .messageCount(entity.getMessageCount())
                .conversationType(entity.getConversationType())
                .currentTopic(entity.getCurrentTopic())
                .lastMessagePreview(lastMessagePreview)
                .build();
    }

    private ChatMessageDto mapToMessageDto(ChatMessage entity) {
        List<ProductDto> products = null;
        if (entity.getProductsCount() != null && entity.getProductsCount() > 0) {
            products = List.of(); // Placeholder
        }

        return ChatMessageDto.builder()
                .id(entity.getMessageId())
                .sessionId(entity.getSession().getSessionId())
                .conversationId(entity.getSession().getConversationId())
                .role(entity.getRole())
                .content(entity.getContent())
                .status(entity.getStatus())
                .timestamp(entity.getCreatedAt())
                .products(products)
                .totalFound(entity.getProductsCount())
                .build();
    }
}