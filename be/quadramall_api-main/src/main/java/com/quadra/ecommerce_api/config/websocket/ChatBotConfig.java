package com.quadra.ecommerce_api.config.websocket;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@ConfigurationProperties(prefix = "chatbot")
@Data
public class ChatBotConfig {

    private AiService aiService = new AiService();
    private Session session = new Session();
    private WebSocket webSocket = new WebSocket();

    @Data
    public static class AiService {
        private String url = "http://localhost:8000";
        private int timeout = 30;
        private int maxRetries = 3;
        private int retryDelay = 1000;
        private boolean fallbackEnabled = true;
    }

    @Data
    public static class Session {
        private int maxSessionsPerUser = 10;
        private int sessionTimeoutHours = 24;
        private int cleanupIntervalMinutes = 60;
        private int maxMessagesPerSession = 100;
        private boolean persistSessions = true;
    }

    @Data
    public static class WebSocket {
        private int heartbeatInterval = 25000;
        private int connectionTimeout = 60000;
        private String[] allowedOrigins = {"*"};
        private int maxTextMessageSize = 64 * 1024; // 64KB
        private int maxBinaryMessageSize = 64 * 1024; // 64KB
    }

    @Bean(name = "chatBotTaskExecutor")
    public Executor chatBotTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ChatBot-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Bean(name = "chatStreamingTaskExecutor")
    public Executor chatStreamingTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("ChatStreaming-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}