package com.aiinterview.module.user.entity;

import com.aiinterview.module.auth.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * User profile entity — separated from {@link User} for SRP.
 *
 * <p>Contains all non-auth user data: bio, skills, social links, photo.
 * Created automatically when a user registers (via cascade).
 *
 * <p>Skills stored as JSONB for flexibility (no schema migration needed
 * when skill categories change).
 */
@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @Column(name = "photo_key", length = 500)
    private String photoKey;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "current_role", length = 200)
    private String currentRole;

    @Column(name = "target_role", length = 200)
    private String targetRole;

    /**
     * Skills stored as a JSON array of strings.
     * Example: ["Java", "Spring Boot", "PostgreSQL"]
     *
     * Note: requires hypersistence-utils for JSONB mapping.
     * Simpler alternative: store as comma-separated VARCHAR.
     */
    @Column(columnDefinition = "jsonb", nullable = false)
    private String skills = "[]";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
