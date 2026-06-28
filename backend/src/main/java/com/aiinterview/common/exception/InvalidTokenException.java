package com.aiinterview.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidTokenException extends ApiException {
    public InvalidTokenException() {
        super("The provided token is invalid.", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
    }
    public InvalidTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
    }
}
