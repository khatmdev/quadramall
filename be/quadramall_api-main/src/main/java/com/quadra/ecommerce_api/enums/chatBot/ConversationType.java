package com.quadra.ecommerce_api.enums.chatBot;

import lombok.Getter;

@Getter
public enum ConversationType {
    PRODUCT_SEARCH("product_search"),
    POLICY_SUPPORT("policy_support"),
    USER_SUPPORT("user_support"),
    GENERAL("general");

    private final String value;

    ConversationType(String value) {
        this.value = value;
    }

    public static ConversationType fromValue(String value) {
        for (ConversationType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown ConversationType: " + value);
    }
}