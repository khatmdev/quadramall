package com.quadra.ecommerce_api.enums.redis;

import com.quadra.ecommerce_api.common.RedisKey;
import com.quadra.ecommerce_api.common.RedisTTL;

import java.time.Duration;
import java.util.function.Function;

public enum RedisCacheKey {

    // ============ STATIC KEY ============
    HOME_INTRO("home:intro", RedisTTL.Key.INTRODUCTION),
    BANNERS_ACTIVE("home:banners:active", RedisTTL.Key.BANNER_LIST_HOME),
    TOP_STORES("home:stores:top10", RedisTTL.Key.STORE_TOP_CACHE),
    ITEM_TYPES("home:item-types", RedisTTL.Key.ITEM_TYPES),

    // ============ DYNAMIC KEY (sử dụng RedisTTL.Key) ============
    PRODUCT_SOLD_COUNT(RedisTTL.Key.PRODUCT_SOLD_COUNT, args -> {
        Long productId = (Long) args[0];
        return RedisKey.product("soldCount", productId);
    }),

    PRODUCT_MIN_PRICE(RedisTTL.Key.PRODUCT_MIN_PRICE, args -> {
        Long productId = (Long) args[0];
        return RedisKey.product("minPrice", productId);
    }),

    PRODUCT_RATING(RedisTTL.Key.PRODUCT_RATING, args -> {
        Long productId = (Long) args[0];
        return RedisKey.product("rating", productId);
    }),

    STORE_RATING(RedisTTL.Key.STORE_RATING, args -> {
        Long storeId = (Long) args[0];
        return RedisKey.store("rating", storeId);
    }),

    // ============ DYNAMIC KEY (TTL tự định nghĩa) ============
    PRODUCT_DETAIL(Duration.ofMinutes(30), args -> {
        Long productId = (Long) args[0];
        return RedisKey.product("detail", productId);
    });

    // =================== FIELDS ===================
    private final String staticKey;
    private final RedisTTL.Key ttlKey;
    private final Duration customTtl;
    private final Function<Object[], String> keyBuilder;

    // STATIC
    RedisCacheKey(String staticKey, RedisTTL.Key ttlKey) {
        this.staticKey = staticKey;
        this.ttlKey = ttlKey;
        this.customTtl = null;
        this.keyBuilder = null;
    }

    // DYNAMIC - theo RedisTTL.Key
    RedisCacheKey(RedisTTL.Key ttlKey, Function<Object[], String> keyBuilder) {
        this.staticKey = null;
        this.ttlKey = ttlKey;
        this.customTtl = null;
        this.keyBuilder = keyBuilder;
    }

    // DYNAMIC - với Duration tùy ý
    RedisCacheKey(Duration customTtl, Function<Object[], String> keyBuilder) {
        this.staticKey = null;
        this.ttlKey = null;
        this.customTtl = customTtl;
        this.keyBuilder = keyBuilder;
    }

    public String key(Object... args) {
        if (staticKey != null) return staticKey;
        if (keyBuilder != null) return keyBuilder.apply(args);
        throw new IllegalStateException("No key defined");
    }

    public Duration ttl() {
        if (ttlKey != null) return RedisTTL.of(ttlKey);
        if (customTtl != null) return customTtl;
        throw new IllegalStateException("TTL not defined");
    }
}



