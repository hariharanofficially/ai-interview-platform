package com.aiinterview.module.auth.entity;

import com.aiinterview.common.audit.AuditableEntity;
import com.aiinterview.module.user.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Core user entity.
 *
 * <p>Stores authentication credentials and role only. All profile data
 * (bio, skills, photo) lives in {@link UserProfile} to enforce SRP.
 *
 * <p>The email field is the login identifier and must be unique and lowercase.
 * Lowercase enforcement happens at the service layer before persisting.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.CANDIDATE;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private UserProfile profile;

    // ── Convenience methods ───────────────────────────────────────────

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
