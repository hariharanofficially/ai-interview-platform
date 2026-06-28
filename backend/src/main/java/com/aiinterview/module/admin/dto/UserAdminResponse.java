package com.aiinterview.module.admin.dto;

import com.aiinterview.module.auth.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserAdminResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean emailVerified;
    private boolean active;
    private Instant createdAt;
}
