package com.aiinterview.module.auth.entity;

/**
 * User roles supported by the platform.
 * Stored as VARCHAR in DB; prefixed with "ROLE_" by Spring Security.
 */
public enum Role {
    CANDIDATE,
    ADMIN
}
