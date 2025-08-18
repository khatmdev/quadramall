package com.quadra.ecommerce_api.exception;

import lombok.Getter;



import org.springframework.http.HttpStatus;

@Getter
public class ExCustom extends RuntimeException {
    private final HttpStatus status;

    public ExCustom(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
