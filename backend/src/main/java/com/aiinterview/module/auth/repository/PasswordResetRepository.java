package com.aiinterview.module.auth.repository;

import com.aiinterview.module.auth.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID> {

    Optional<PasswordReset> findByToken(String token);

    @Modifying
    @Query("DELETE FROM PasswordReset p WHERE p.expiresAt < :cutoff OR p.used = true")
    int deleteExpiredAndUsed(@Param("cutoff") Instant cutoff);
}
