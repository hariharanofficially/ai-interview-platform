package com.aiinterview.module.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight user summary embedded in auth responses.
 * Does not expose sensitive fields.
 */
@Data
@Builder
public class UserSummaryResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;
    private boolean emailVerified;
    private String photoUrl;
    private Instant createdAt;
}
