package com.quadra.ecommerce_api.config.websocket;

import com.quadra.ecommerce_api.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        log.info("🤝 WebSocket handshake attempt from: {}", request.getRemoteAddress());

        try {
            String token = extractToken(request);

            if (StringUtils.hasText(token)) {
                try {
                    String userId = jwtUtil.validateTokenForUserId(token);
                    if (StringUtils.hasText(userId)) {
                        attributes.put("userId", userId);
                        attributes.put("token", token);

                        log.info("✅ WebSocket handshake approved for user ID: {}", userId);
                        return true;
                    } else {
                        log.warn("❌ Invalid token in WebSocket handshake");
                    }
                } catch (Exception e) {
                    log.warn("❌ Token validation failed in handshake: {}", e.getMessage());
                }
            } else {
                log.warn("⚠️ No token provided in WebSocket handshake - allowing for SockJS compatibility");
                // Allow connection without token for SockJS compatibility
                // Authentication will be handled in the STOMP CONNECT frame
                return true;
            }
        } catch (Exception e) {
            log.error("❌ Error during WebSocket handshake: {}", e.getMessage());
        }

        // Allow connection even without token - authentication handled later in STOMP CONNECT
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("❌ WebSocket handshake failed: {}", exception.getMessage());
        } else {
            log.info("✅ WebSocket handshake completed successfully");
        }
    }

    private String extractToken(ServerHttpRequest request) {
        // 1. Check Authorization header
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Check query parameter (for SockJS compatibility)
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            String tokenParam = servletRequest.getParameter("token");
            if (StringUtils.hasText(tokenParam)) {
                return tokenParam;
            }
        }

        // 3. Check URI path for token
        String query = request.getURI().getQuery();
        if (StringUtils.hasText(query) && query.contains("token=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    return param.substring(6); // "token=".length()
                }
            }
        }

        return null;
    }
}