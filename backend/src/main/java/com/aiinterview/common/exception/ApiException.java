package com.aiinterview.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for all application-specific errors.
 *
 * <p>Subclasses set the HTTP status to return. The {@link GlobalExceptionHandler}
 * catches all {@code ApiException} subclasses and maps them to the correct HTTP response.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public ApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status    = status;
        this.errorCode = errorCode;
    }

    public ApiException(String message, HttpStatus status) {
        this(message, status, status.name());
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
