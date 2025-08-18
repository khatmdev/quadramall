package com.quadra.ecommerce_api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisTestRunner implements CommandLineRunner {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void run(String... args) {
        redisTemplate.opsForValue().set("test:key", "hello redis");
        String value = redisTemplate.opsForValue().get("test:key");
        System.out.println("Giá trị từ Redis: " + value);
    }
}
