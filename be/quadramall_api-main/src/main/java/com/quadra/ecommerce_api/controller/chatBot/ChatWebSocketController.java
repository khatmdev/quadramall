package com.quadra.ecommerce_api.controller.chatBot;

import com.quadra.ecommerce_api.dto.custom.chatBot.*;
import com.quadra.ecommerce_api.service.chatBot.ChatBotService;
import com.quadra.ecommerce_api.service.chatBot.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatBotService chatBotService;
    private final WebSocketService webSocketService;

    @MessageMapping("/chat.send")
    public void handleChatMessage(@Payload ChatRequestDto request, Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.info("WebSocket chat message from user: {}", userId);

            // Set streaming to true for WebSocket messages
            var streamingRequest = new ChatRequestDto(
                    request.message(),
                    request.sessionId(),
                    request.conversationId(),
                    true
            );

            // Process message asynchronously with streaming
            chatBotService.processMessageStream(streamingRequest, userId)
                    .doOnNext(chunk -> {
                        // Messages are automatically sent via WebSocketService in the service layer
                        log.trace("Processing stream chunk: {}", chunk.type());
                    })
                    .doOnComplete(() -> {
                        log.info("WebSocket chat stream completed for user: {}", userId);
                    })
                    .doOnError(error -> {
                        log.error("WebSocket chat error for user {}: {}", userId, error.getMessage());
                        webSocketService.sendErrorMessage(userId, request.sessionId(), error.getMessage());
                    })
                    .subscribe();

        } catch (Exception e) {
            log.error("Error handling WebSocket chat message: {}", e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(@Payload TypingIndicatorDto payload, Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.trace("Typing indicator from user {}: {} in session {}",
                    userId, payload.isTyping(), payload.sessionId());

            webSocketService.sendTypingIndicator(userId, payload.sessionId(), payload.isTyping());

        } catch (Exception e) {
            log.error("Error handling typing indicator: {}", e.getMessage());
        }
    }

    @MessageMapping("/chat.join")
    @SendToUser("/queue/status")
    public WebSocketMessageDto handleJoinSession(@Payload SessionJoinDto payload, Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.info("User {} joining chat session: {}", userId, payload.sessionId());

            webSocketService.addConnectedUser(userId, payload.sessionId());
            webSocketService.sendSessionJoined(userId, payload.sessionId());

            return WebSocketMessageDto.builder()
                    .type("session_joined")
                    .payload(Map.of(
                            "sessionId", payload.sessionId(),
                            "userId", userId.toString(),
                            "status", "connected"
                    ))
                    .sessionId(payload.sessionId())
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error handling session join: {}", e.getMessage());
            return WebSocketMessageDto.builder()
                    .type("error")
                    .payload("Failed to join session")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    @MessageMapping("/chat.leave")
    @SendToUser("/queue/status")
    public WebSocketMessageDto handleLeaveSession(@Payload SessionLeaveDto payload, Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.info("User {} leaving chat session: {}", userId, payload.sessionId());

            webSocketService.sendSessionLeft(userId, payload.sessionId());
            webSocketService.removeConnectedUser(userId);

            return WebSocketMessageDto.builder()
                    .type("session_left")
                    .payload(Map.of(
                            "sessionId", payload.sessionId(),
                            "userId", userId.toString(),
                            "status", "disconnected"
                    ))
                    .sessionId(payload.sessionId())
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error handling session leave: {}", e.getMessage());
            return WebSocketMessageDto.builder()
                    .type("error")
                    .payload("Failed to leave session")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    @SubscribeMapping("/queue/chat")
    public WebSocketMessageDto handleChatSubscription(Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.info("User {} subscribed to chat queue", userId);

            webSocketService.sendConnectionConfirmation(userId);

            return WebSocketMessageDto.builder()
                    .type("subscription_confirmed")
                    .payload(Map.of(
                            "userId", userId.toString(),
                            "queue", "chat"
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error handling chat subscription: {}", e.getMessage());
            return WebSocketMessageDto.builder()
                    .type("error")
                    .payload("Subscription failed")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    @SubscribeMapping("/queue/typing")
    public WebSocketMessageDto handleTypingSubscription(Principal principal) {
        try {
            Long userId = extractUserIdFromPrincipal(principal);
            log.trace("User {} subscribed to typing indicators", userId);

            return WebSocketMessageDto.builder()
                    .type("typing_subscription_confirmed")
                    .payload(Map.of("userId", userId.toString()))
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error handling typing subscription: {}", e.getMessage());
            return WebSocketMessageDto.builder()
                    .type("error")
                    .payload("Typing subscription failed")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    private Long extractUserIdFromPrincipal(Principal principal) {
        // Extract user ID from Principal - implement based on your JWT/auth setup
        if (principal != null) {
            try {
                // If principal name contains user ID
                return Long.parseLong(principal.getName());
            } catch (NumberFormatException e) {
                // If principal name is username, lookup user ID
                // return userService.findByUsername(principal.getName()).getId();
                return 1L; // Fallback for development
            }
        }
        return 1L; // Default fallback
    }

}
