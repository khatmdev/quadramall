package com.quadra.ecommerce_api.enums.chatBot;

import lombok.Getter;

@Getter
public enum StreamChunkType {
    CONTENT("content"),
    PRODUCTS("products"),
    METADATA("metadata"),
    DONE("done"),
    ERROR("error"),
    TYPING("typing");

    private final String value;

    StreamChunkType(String value) {
        this.value = value;
    }

    public static StreamChunkType fromValue(String value) {
        for (StreamChunkType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown StreamChunkType: " + value);
    }
}