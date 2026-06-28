package com.aiinterview.module.auth.repository;

import com.aiinterview.module.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    Optional<EmailVerification> findByToken(String token);

    @Modifying
    @Query("DELETE FROM EmailVerification e WHERE e.expiresAt < :cutoff OR e.used = true")
    int deleteExpiredAndUsed(@Param("cutoff") Instant cutoff);
}
