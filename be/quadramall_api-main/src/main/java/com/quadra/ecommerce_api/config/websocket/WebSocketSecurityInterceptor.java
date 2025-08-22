package com.quadra.ecommerce_api.config.websocket;

import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketSecurityInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepo userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            log.debug("WebSocket message - Command: {}, Destination: {}",
                    accessor.getCommand(), accessor.getDestination());

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = extractToken(accessor);

                if (StringUtils.hasText(token)) {
                    try {
                        String userId = jwtUtil.validateTokenForUserId(token);

                        if (StringUtils.hasText(userId)) {
                            Optional<User> userOpt = userRepository.findById(Long.parseLong(userId));

                            if (userOpt.isPresent()) {
                                User user = userOpt.get();

                                Authentication auth = new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        user.getRoles().stream()
                                                .map(r -> new SimpleGrantedAuthority(r.getName()))
                                                .toList()
                                );

                                SecurityContextHolder.getContext().setAuthentication(auth);
                                accessor.setUser(auth);

                                log.info("✅ WebSocket authenticated user: {} ({})", user.getFullName(), user.getEmail());
                            } else {
                                log.warn("❌ User not found for ID: {}", userId);
                            }
                        } else {
                            log.warn("❌ Invalid JWT token for WebSocket connection");
                        }
                    } catch (Exception e) {
                        log.error("❌ WebSocket authentication failed: {}", e.getMessage());
                    }
                } else {
                    log.warn("⚠️ No token found in WebSocket CONNECT frame");
                }
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Try multiple sources for the token

        // 1. Authorization header
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Direct token header
        String tokenHeader = accessor.getFirstNativeHeader("token");
        if (StringUtils.hasText(tokenHeader)) {
            return tokenHeader;
        }

        // 3. X-Auth-Token header
        String xAuthToken = accessor.getFirstNativeHeader("X-Auth-Token");
        if (StringUtils.hasText(xAuthToken)) {
            return xAuthToken;
        }

        log.debug("No token found in WebSocket headers");
        return null;
    }
}