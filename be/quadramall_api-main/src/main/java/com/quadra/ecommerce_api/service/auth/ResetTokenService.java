package com.quadra.ecommerce_api.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class ResetTokenService {

    private final StringRedisTemplate redisTemplate;

    @Autowired
    public ResetTokenService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    public void storeResetToken(String token, String email, int expireMinutes) {
        String key = "reset:" + token;
        redisTemplate.opsForValue().set(key, email, expireMinutes, TimeUnit.MINUTES);
    }

    public Optional<String> getEmailByToken(String token) {
        String key = "reset:" + token;
        String email = redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(email);
    }

    public void clearResetToken(String token) {
        String key = "reset:" + token;
        redisTemplate.delete(key);
    }
}