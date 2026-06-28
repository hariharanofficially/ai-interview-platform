package com.aiinterview.common.exception;

import org.springframework.http.HttpStatus;

public class TokenExpiredException extends ApiException {
    public TokenExpiredException(String tokenType) {
        super(tokenType + " token has expired. Please request a new one.", HttpStatus.GONE, "TOKEN_EXPIRED");
    }
}
