package com.quadra.ecommerce_api.common;

import java.time.Duration;
import java.util.EnumMap;

/**
 * Cung cấp TTL (thời gian sống) cho các loại cache Redis.
 * Thay thế việc hard-code Duration trong mã nguồn.
 */
public final class RedisTTL {

    private RedisTTL() {}

    public enum Key {
        STORE_TOP_CACHE,
        PRODUCT_SOLD_COUNT,
        PRODUCT_RATING,
        PRODUCT_MIN_PRICE,
        STORE_RATING,
        TOP_STORE_LIST,
        BANNER_LIST_HOME,
        INTRODUCTION,
        ITEM_TYPES,
    }

    private static final EnumMap<Key, Duration> TTL_MAP = new EnumMap<>(Key.class);

    static {
        TTL_MAP.put(Key.STORE_TOP_CACHE, Duration.ofHours(2));
        TTL_MAP.put(Key.PRODUCT_SOLD_COUNT, Duration.ofHours(6));
        TTL_MAP.put(Key.PRODUCT_RATING, Duration.ofHours(2));
        TTL_MAP.put(Key.PRODUCT_MIN_PRICE, Duration.ofMinutes(30));
        TTL_MAP.put(Key.STORE_RATING, Duration.ofHours(2));
        TTL_MAP.put(Key.TOP_STORE_LIST, Duration.ofHours(1));
        TTL_MAP.put(Key.BANNER_LIST_HOME, Duration.ofHours(1));
        TTL_MAP.put(Key.INTRODUCTION, Duration.ofHours(2));
        TTL_MAP.put(Key.ITEM_TYPES, Duration.ofHours(12));
    }

    public static Duration of(Key key) {
        return TTL_MAP.getOrDefault(key, Duration.ofHours(1)); // fallback default
    }
}

