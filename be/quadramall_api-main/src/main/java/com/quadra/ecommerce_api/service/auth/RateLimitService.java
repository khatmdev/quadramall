package com.quadra.ecommerce_api.service.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;
    private final int maxRequests;
    private final long windowSeconds;

    public RateLimitService(
            StringRedisTemplate redisTemplate,
            @Value("${rate.limit.max-requests:3}") int maxRequests,
            @Value("${rate.limit.window-seconds:3600}") long windowSeconds) {
        this.redisTemplate = redisTemplate;
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    public boolean isAllowed(String email) {
        String key = "rate:limit:" + email;
        String countStr = redisTemplate.opsForValue().get(key);

        int count = countStr != null ? Integer.parseInt(countStr) : 0;

        if (count >= maxRequests) {
            return false;
        }

        redisTemplate.opsForValue().increment(key, 1);
        if (count == 0) {
            redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
        }

        return true;
    }
}