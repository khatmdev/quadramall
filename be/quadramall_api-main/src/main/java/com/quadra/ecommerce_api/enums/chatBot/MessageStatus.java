package com.quadra.ecommerce_api.enums.chatBot;

import lombok.Getter;

@Getter
public enum MessageStatus {
    SENT("sent"),
    DELIVERED("delivered"),
    READ("read"),
    ERROR("error"),
    PROCESSING("processing");

    private final String value;

    MessageStatus(String value) {
        this.value = value;
    }

    public static MessageStatus fromValue(String value) {
        for (MessageStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown MessageStatus: " + value);
    }
}
