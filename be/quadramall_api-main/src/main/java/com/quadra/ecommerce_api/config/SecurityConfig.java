// SecurityConfig.java - Fixed WebSocket Authentication
package com.quadra.ecommerce_api.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // ✅ CORS Preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ WebSocket endpoints - CRITICAL FIX: Allow all WebSocket traffic initially
                        .requestMatchers("/ws").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws/info").permitAll()
                        .requestMatchers("/ws/chatbot").permitAll()
                        .requestMatchers("/ws/chatbot/**").permitAll()

                        .requestMatchers("/ws").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws/*/websocket").permitAll()
                        .requestMatchers("/ws/*/xhr").permitAll()
                        .requestMatchers("/ws/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/*/eventsource").permitAll()
                        .requestMatchers("/app/**").permitAll()
                        .requestMatchers("/topic/**").permitAll()
                        .requestMatchers("/queue/**").permitAll()
                        .requestMatchers("/user/**").permitAll()

                        // ✅ SockJS specific endpoints
                        .requestMatchers("/ws/*/websocket").permitAll()
                        .requestMatchers("/ws/*/xhr").permitAll()
                        .requestMatchers("/ws/*/xhr_send").permitAll()
                        .requestMatchers("/ws/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/*/eventsource").permitAll()
                        .requestMatchers("/ws/*/htmlfile").permitAll()
                        .requestMatchers("/ws/*/jsonp").permitAll()
                        .requestMatchers("/ws/*/jsonp_send").permitAll()

                        // ✅ STOMP messaging endpoints
                        .requestMatchers("/app/**").permitAll()
                        .requestMatchers("/topic/**").permitAll()
                        .requestMatchers("/queue/**").permitAll()
                        .requestMatchers("/user/**").permitAll()

                        // ✅ Authentication endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/payment/**").permitAll()
                        .requestMatchers("/address/**").permitAll()
                        .requestMatchers("/seller-registrations").permitAll()

                        // ✅ Static resources
                        .requestMatchers("/static/**").permitAll()
                        .requestMatchers("/assets/**").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/css/**").permitAll()
                        .requestMatchers("/js/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()

                        // ✅ API Documentation
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/v3/api-docs.yaml").permitAll()

                        // ✅ ChatBot API endpoints
                        .requestMatchers("/api/v1/chatbot/health").permitAll()
                        .requestMatchers("/api/v1/chatbot/**").permitAll()
                        .requestMatchers("/api/chatbot/**").permitAll()

                        // ✅ Role-based access control
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/seller/**").hasRole("SELLER")
                        .requestMatchers("/api/seller/**").hasRole("SELLER")
                        .requestMatchers("/buyer/**").hasRole("BUYER")
                        .requestMatchers("/api/buyer/**").hasRole("BUYER")
                        .requestMatchers("/api/customer/**").hasRole("BUYER")
                        .requestMatchers("/api/shipper/**").hasRole("SHIPPER")
                        .requestMatchers("/products/**").permitAll()

                        // ✅ Public endpoints
                        .requestMatchers(HttpMethod.GET, "/api/customer/delivery/tracking/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // ✅ Default: require authentication
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            String errorMessage = String.format(
                                    "{\"error\":\"Unauthorized\",\"message\":\"%s\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                                    authException.getMessage(),
                                    request.getRequestURI(),
                                    java.time.LocalDateTime.now()
                            );
                            response.getWriter().write(errorMessage);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            String errorMessage = String.format(
                                    "{\"error\":\"Access Denied\",\"message\":\"%s\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                                    accessDeniedException.getMessage(),
                                    request.getRequestURI(),
                                    java.time.LocalDateTime.now()
                            );
                            response.getWriter().write(errorMessage);
                        })
                )

                .oauth2Login(oauth2 -> oauth2
                        .successHandler((request, response, authentication) -> {
                            response.sendRedirect("/auth/oauth2/success");
                        })
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect("/auth/oauth2/error");
                        })
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ CRITICAL FIX: Use allowedOriginPatterns for wildcards
        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));

        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}