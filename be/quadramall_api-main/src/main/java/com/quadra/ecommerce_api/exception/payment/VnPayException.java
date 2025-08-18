package com.quadra.ecommerce_api.exception.payment;

public class VnPayException extends RuntimeException {
    private String rspCode;
    private String message;

    public VnPayException(String rspCode, String message) {
        super(message);
        this.rspCode = rspCode;
        this.message = message;
    }

    public String getRspCode() {
        return rspCode;
    }

    public String getMessage() {
        return message;
    }
}