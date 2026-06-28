package com.aiinterview.module.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionResponse {
    private UUID id;
    private String targetRole;
    private String difficulty;
    private String status;
    private Integer overallScore;
    private Instant startedAt;
    private Instant completedAt;
    private Instant createdAt;
    private List<InterviewQuestionResponse> questions;
}
