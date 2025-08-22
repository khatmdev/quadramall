package com.quadra.ecommerce_api.config.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketSecurityInterceptor webSocketSecurityInterceptor;
    private final WebSocketHandshakeInterceptor webSocketHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // ✅ Enable simple broker for sending messages to subscribers
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // ✅ Set prefix for messages bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");

        // ✅ Set prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");

        log.info("✅ Message broker configured successfully");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ Main WebSocket endpoint with SockJS fallback and auth interceptor
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(webSocketHandshakeInterceptor)
                .withSockJS()
                .setHeartbeatTime(25000)
                .setDisconnectDelay(5000)
                .setHttpMessageCacheSize(1000)
                .setStreamBytesLimit(128 * 1024)
                .setSessionCookieNeeded(false)
                .setSuppressCors(true)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");

        // ✅ Native WebSocket endpoint (without SockJS)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(webSocketHandshakeInterceptor);

        // ✅ Specific ChatBot endpoint
        registry.addEndpoint("/ws/chatbot")
                .setAllowedOriginPatterns("*")
                .addInterceptors(webSocketHandshakeInterceptor)
                .withSockJS()
                .setHeartbeatTime(25000)
                .setDisconnectDelay(5000)
                .setSessionCookieNeeded(false)
                .setSuppressCors(true);

        log.info("✅ STOMP endpoints registered successfully with authentication interceptors");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // ✅ Add the security interceptor to handle authentication
        registration.interceptors(webSocketSecurityInterceptor);
        registration.taskExecutor().corePoolSize(4);
        registration.taskExecutor().maxPoolSize(8);
        log.info("✅ Client inbound channel configured with security interceptor");
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        registration.taskExecutor().corePoolSize(4);
        registration.taskExecutor().maxPoolSize(8);
        log.info("✅ Client outbound channel configured");
    }
}