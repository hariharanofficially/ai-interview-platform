package com.aiinterview.module.interview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewSetupRequest {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    @NotBlank(message = "Difficulty is required")
    private String difficulty; // JUNIOR, MID, SENIOR

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 10, message = "Maximum 10 questions allowed")
    private int questionCount = 5;
}
