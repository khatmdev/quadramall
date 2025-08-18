package com.quadra.ecommerce_api.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class RedisOtpService {

    private final StringRedisTemplate redisTemplate;

    @Autowired
    public RedisOtpService(StringRedisTemplate stringRedisTemplate) {
        this.redisTemplate = stringRedisTemplate;
    }



    private final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void storeOtp(String email, String type, String otp, int expireMinutes) {
        String key = buildKey(email, type);
        redisTemplate.opsForValue().set(key, otp, expireMinutes, TimeUnit.MINUTES);
    }

    public boolean validateOtp(String email, String type, String otpInput) {
        String key = buildKey(email, type);
        String storedOtp = redisTemplate.opsForValue().get(key);
        return storedOtp != null && storedOtp.equals(otpInput);
    }

    public void clearOtp(String email, String type) {
        redisTemplate.delete(buildKey(email, type));
    }

    private String buildKey(String email, String type) {
        return "otp:" + email + ":" + type;
    }
}
