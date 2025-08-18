package com.quadra.ecommerce_api.service.ml;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class RecommendationService {

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, String> redis;

    @Autowired
    public RecommendationService(
            ObjectMapper objectMapper,
            RedisTemplate<String, String> redis
    ) {
        this.objectMapper = objectMapper;
        this.redis = redis;
    }

    public List<Long> getRecommendationsForUser(Long userId) {
        // Ưu tiên đề xuất động
        String dynamicKey = "rec_user_dynamic:" + userId;
        String raw = redis.opsForValue().get(dynamicKey);

        if (raw != null) {
            try {
                return objectMapper.readValue(raw, new TypeReference<>() {});
            } catch (IOException e) {
                // Fallback to static recommendations
            }
        }

        // Nếu không có đề xuất động, lấy đề xuất tĩnh
        String staticKey = "rec_user:" + userId;
        raw = redis.opsForValue().get(staticKey);
        if (raw == null) {
            return List.of(); // Fallback rỗng
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<>() {});
        } catch (IOException e) {
            return List.of();
        }
    }
}