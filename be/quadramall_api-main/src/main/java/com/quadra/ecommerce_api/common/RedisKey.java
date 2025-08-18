package com.quadra.ecommerce_api.common;

/**
 * RedisKey DSL builder cho các domain chính trong hệ thống.
 * Giúp tạo key một cách rõ ràng, có kiểm soát, hạn chế nhầm lẫn key format.
 */
public final class RedisKey {

    private RedisKey() {}

    // --------- Dạng prefix + subkey + id ---------

    public static String product(String subKey, Long id) {
        return build("product", subKey, id);
    }

    public static String store(String subKey, Long id) {
        return build("store", subKey, id);
    }

    public static String user(String subKey, Long id) {
        return build("user", subKey, id);
    }

    public static String order(String subKey, Long id) {
        return build("order", subKey, id);
    }

    // --------- Dạng key cố định không có id ---------

    public static String fixed(String fullKey) {
        return fullKey;
    }

    // --------- Helper riêng ---------

    private static String build(String domain, String subKey, Long id) {
        if (domain == null || subKey == null || id == null) {
            throw new IllegalArgumentException("Redis key parts must not be null");
        }
        return String.format("%s:%s:%d", domain, subKey, id);
    }
}

