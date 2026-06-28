package com.aiinterview.module.interview.repository;

import com.aiinterview.module.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
