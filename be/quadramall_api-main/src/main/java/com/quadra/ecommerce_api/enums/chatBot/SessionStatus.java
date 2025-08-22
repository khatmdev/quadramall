package com.quadra.ecommerce_api.enums.chatBot;

import lombok.Getter;

@Getter
public enum SessionStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    CLOSED("closed"),
    ERROR("error");

    private final String value;

    SessionStatus(String value) {
        this.value = value;
    }

    public static SessionStatus fromValue(String value) {
        for (SessionStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown SessionStatus: " + value);
    }
}
