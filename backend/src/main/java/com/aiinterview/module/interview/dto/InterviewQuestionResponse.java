package com.aiinterview.module.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionResponse {
    private UUID id;
    private String questionText;
    private Integer orderIndex;
    private Object expectedKeyPoints; // JSON
    private String aiFeedback;
    private Integer score;
}
