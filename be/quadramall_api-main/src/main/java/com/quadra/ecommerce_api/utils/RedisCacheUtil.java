package com.quadra.ecommerce_api.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * RedisCacheUtil: tiện ích dùng để đọc/ghi dữ liệu cache từ Redis
 * Hỗ trợ Object (JSON), Long, Double
 */
@Component
public class RedisCacheUtil {

    private final ObjectMapper objectMapper;

    private final RedisTemplate<String, Object> objectRedis;

    private final RedisTemplate<String, Long> longRedis;

    private final RedisTemplate<String, Double> doubleRedis;

    @Autowired
    public RedisCacheUtil(
            ObjectMapper objectMapper,
            @Qualifier("objectRedisTemplate") RedisTemplate<String, Object> objectRedis,
            @Qualifier("longRedisTemplate") RedisTemplate<String, Long> longRedis,
            @Qualifier("doubleRedisTemplate") RedisTemplate<String, Double> doubleRedis
    ) {
        this.objectMapper = objectMapper;
        this.objectRedis = objectRedis;
        this.longRedis = longRedis;
        this.doubleRedis = doubleRedis;
    }

    // ======================== Object / JSON ========================= //

    /**
     * Lấy 1 object kiểu cụ thể từ Redis (dạng JSON lưu trữ)
     */
    public <T> T get(String key, Class<T> clazz) {
        Object raw = objectRedis.opsForValue().get(key);
        return Optional.ofNullable(raw)
                .map(val -> objectMapper.convertValue(val, clazz))
                .orElse(null);
    }

    /**
     * Lấy 1 object dạng generic (List, Map, v.v.) từ Redis (dạng JSON lưu trữ)
     */
    public <T> T get(String key, TypeReference<T> typeRef) {
        Object raw = objectRedis.opsForValue().get(key);
        return Optional.ofNullable(raw)
                .map(val -> objectMapper.convertValue(val, typeRef))
                .orElse(null);
    }

    /**
     * Ghi dữ liệu bất kỳ (sẽ được serialize thành JSON) vào Redis
     */
    public void set(String key, Object value, Duration ttl) {
        objectRedis.opsForValue().set(key, value, ttl);
    }

    /**
     * Xoá cache object dạng JSON
     */
    public void deleteObject(String key) {
        objectRedis.delete(key);
    }

    // ======================== Long ========================= //

    /**
     * Ghi giá trị Long vào Redis
     */
    public void setLong(String key, Long value, Duration ttl) {
        longRedis.opsForValue().set(key, value, ttl);
    }

    /**
     * Lấy giá trị Long từ Redis
     */
    public Long getLong(String key) {
        return longRedis.opsForValue().get(key);
    }

    /**
     * Tăng giá trị Long lên 1 đơn vị (thường dùng cho đếm lượt)
     */
    public Long incrementLong(String key) {
        return longRedis.opsForValue().increment(key);
    }

    /**
     * Xoá key long
     */
    public void deleteLong(String key) {
        longRedis.delete(key);
    }

    // ======================== Double ========================= //

    /**
     * Ghi giá trị Double vào Redis
     */
    public void setDouble(String key, Double value, Duration ttl) {
        doubleRedis.opsForValue().set(key, value, ttl);
    }

    /**
     * Lấy giá trị Double từ Redis
     */
    public Double getDouble(String key) {
        return doubleRedis.opsForValue().get(key);
    }

    /**
     * Tăng giá trị Double lên step (dùng cho score, rating,...)
     */
    public Double incrementDouble(String key, double step) {
        return doubleRedis.opsForValue().increment(key, step);
    }

    /**
     * Xoá key double
     */
    public void deleteDouble(String key) {
        doubleRedis.delete(key);
    }

    // ======================== Common ========================= //

    /**
     * Kiểm tra key có tồn tại trong Redis không (bất kể kiểu)
     */
    public boolean exists(String key) {
        // dùng objectRedis vì mọi RedisTemplate đều set chung key kiểu String
        return objectRedis.hasKey(key);
    }

    public void delete(String key) {
        deleteObject(key);
        deleteLong(key);
        deleteDouble(key);
    }

}


