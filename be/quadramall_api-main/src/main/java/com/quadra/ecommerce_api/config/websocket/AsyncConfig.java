package com.quadra.ecommerce_api.config.websocket;


import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig implements WebMvcConfigurer {

    /**
     * ✅ CRITICAL FIX: Configure AsyncTaskExecutor for Spring MVC
     */
    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setDefaultTimeout(60000); // 60 seconds
        configurer.setTaskExecutor(asyncTaskExecutor());
        log.info("Spring MVC Async Support configured with custom TaskExecutor");
    }

    /**
     * ✅ Main AsyncTaskExecutor for Spring MVC
     */
    @Bean(name = "asyncTaskExecutor")
    public ThreadPoolTaskExecutor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // ✅ Core pool configuration
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);

        // ✅ Thread naming and lifecycle
        executor.setThreadNamePrefix("Async-MVC-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        // ✅ Rejection policy - Important for high load
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // ✅ Allow core threads to timeout
        executor.setAllowCoreThreadTimeOut(true);
        executor.setKeepAliveSeconds(60);

        executor.initialize();

        log.info("AsyncTaskExecutor configured: core={}, max={}, queue={}",
                executor.getCorePoolSize(),
                executor.getMaxPoolSize(),
                executor.getQueueCapacity());

        return executor;
    }

    /**
     * ✅ Separate executor for ChatBot streaming tasks
     */
    @Bean(name = "chatBotStreamingExecutor")
    public ThreadPoolTaskExecutor chatBotStreamingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(15);
        executor.setMaxPoolSize(100);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("ChatBot-Stream-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        executor.initialize();

        log.info("ChatBot Streaming Executor configured: core={}, max={}, queue={}",
                executor.getCorePoolSize(),
                executor.getMaxPoolSize(),
                executor.getQueueCapacity());

        return executor;
    }

    /**
     * ✅ General purpose async executor
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Task-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());

        executor.initialize();
        return executor;
    }
}