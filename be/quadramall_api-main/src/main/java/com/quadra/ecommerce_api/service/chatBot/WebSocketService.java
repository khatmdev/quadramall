package com.quadra.ecommerce_api.service.chatBot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.dto.custom.chatBot.StreamChunkDto;
import com.quadra.ecommerce_api.dto.custom.chatBot.TypingIndicatorDto;
import com.quadra.ecommerce_api.dto.custom.chatBot.WebSocketMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // Track connected users
    private final ConcurrentMap<Long, String> connectedUsers = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Long> sessionToUser = new ConcurrentHashMap<>();

    public void sendToUser(Long userId, StreamChunkDto chunk) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/chat",
                    chunk
            );
            log.trace("Stream chunk sent to user {}: type={}", userId, chunk.type());
        } catch (Exception e) {
            log.error("Failed to send stream chunk to user {}: {}", userId, e.getMessage());
        }
    }

    public void sendToUser(Long userId, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    destination,
                    payload
            );
            log.trace("Message sent to user {} at destination {}", userId, destination);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to user {}: {}", userId, e.getMessage());
        }
    }

    public void sendToTopic(String topic, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/" + topic, payload);
            log.trace("Message sent to topic {}", topic);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to topic {}: {}", topic, e.getMessage());
        }
    }

    public void sendTypingIndicator(Long userId, String sessionId, boolean isTyping) {
        var typingIndicator = new TypingIndicatorDto(sessionId, isTyping, userId);
        sendToUser(userId, "/queue/typing", typingIndicator);
    }

    public void sendErrorMessage(Long userId, String sessionId, String errorMessage) {
        var errorPayload = WebSocketMessageDto.builder()
                .type("error")
                .payload(errorMessage)
                .sessionId(sessionId)
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/error", errorPayload);
    }

    public void sendSessionJoined(Long userId, String sessionId) {
        var joinPayload = WebSocketMessageDto.builder()
                .type("session_joined")
                .payload(Map.of("sessionId", sessionId, "status", "connected"))
                .sessionId(sessionId)
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/status", joinPayload);

        // Track user connection
        connectedUsers.put(userId, sessionId);
        sessionToUser.put(sessionId, userId);

        log.info("User {} joined session {}", userId, sessionId);
    }

    public void sendSessionLeft(Long userId, String sessionId) {
        var leavePayload = WebSocketMessageDto.builder()
                .type("session_left")
                .payload(Map.of("sessionId", sessionId, "status", "disconnected"))
                .sessionId(sessionId)
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/status", leavePayload);

        // Remove user tracking
        connectedUsers.remove(userId);
        sessionToUser.remove(sessionId);

        log.info("User {} left session {}", userId, sessionId);
    }

    public void sendSessionClosed(Long userId, String sessionId) {
        var closedPayload = WebSocketMessageDto.builder()
                .type("session_closed")
                .payload(Map.of("sessionId", sessionId, "reason", "closed_by_user"))
                .sessionId(sessionId)
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/status", closedPayload);

        log.info("Session {} closed for user {}", sessionId, userId);
    }

    public void broadcastSystemMessage(String message) {
        var systemMessage = WebSocketMessageDto.builder()
                .type("system_message")
                .payload(message)
                .timestamp(LocalDateTime.now())
                .build();

        sendToTopic("system", systemMessage);
        log.info("System message broadcasted: {}", message);
    }

    public void sendConnectionConfirmation(Long userId) {
        var confirmationPayload = WebSocketMessageDto.builder()
                .type("connection_confirmed")
                .payload(Map.of(
                        "userId", userId.toString(),
                        "status", "connected",
                        "features", List.of("streaming", "typing_indicators", "real_time_updates")
                ))
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/status", confirmationPayload);
        log.info("Connection confirmed for user {}", userId);
    }

    public void sendHeartbeat(Long userId) {
        var heartbeatPayload = WebSocketMessageDto.builder()
                .type("heartbeat")
                .payload(Map.of("timestamp", LocalDateTime.now().toString()))
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/heartbeat", heartbeatPayload);
    }

    // User connection management
    public void addConnectedUser(Long userId, String sessionId) {
        connectedUsers.put(userId, sessionId);
        sessionToUser.put(sessionId, userId);
        log.debug("Added connected user: {} with session: {}", userId, sessionId);
    }

    public void removeConnectedUser(Long userId) {
        String sessionId = connectedUsers.remove(userId);
        if (sessionId != null) {
            sessionToUser.remove(sessionId);
            log.debug("Removed connected user: {} with session: {}", userId, sessionId);
        }
    }

    public boolean isUserConnected(Long userId) {
        return connectedUsers.containsKey(userId);
    }

    public String getUserSession(Long userId) {
        return connectedUsers.get(userId);
    }

    public Long getSessionUser(String sessionId) {
        return sessionToUser.get(sessionId);
    }

    public long getConnectedUsersCount() {
        return connectedUsers.size();
    }

    public void disconnectUser(Long userId, String reason) {
        var disconnectPayload = WebSocketMessageDto.builder()
                .type("disconnected")
                .payload(Map.of("reason", reason))
                .timestamp(LocalDateTime.now())
                .build();

        sendToUser(userId, "/queue/status", disconnectPayload);
        removeConnectedUser(userId);

        log.info("User {} disconnected: {}", userId, reason);
    }

    // Statistics and monitoring
    public Map<String, Object> getWebSocketStatistics() {
        return Map.of(
                "connected_users", connectedUsers.size(),
                "active_sessions", sessionToUser.size(),
                "timestamp", LocalDateTime.now()
        );
    }

    // Cleanup methods
    public void cleanupStaleConnections() {
        // This method can be called periodically to clean up stale connections
        // Implementation would depend on your specific requirements
        log.debug("Cleaning up stale WebSocket connections");
    }

    // Helper method for JSON serialization
    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Error serializing object to JSON: {}", e.getMessage());
            return "{}";
        }
    }
}