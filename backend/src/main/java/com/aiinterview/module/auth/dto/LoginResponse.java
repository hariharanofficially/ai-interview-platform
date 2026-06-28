package com.aiinterview.module.auth.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO returned on successful login and token refresh.
 */
@Data
@Builder
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;         // access token TTL in seconds
    private UserSummaryResponse user;

    public static LoginResponse of(String accessToken, String refreshToken,
                                   long expiresInMs, UserSummaryResponse user) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresInMs / 1000)
                .user(user)
                .build();
    }
}
