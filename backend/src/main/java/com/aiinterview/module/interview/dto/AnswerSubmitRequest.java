package com.aiinterview.module.interview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnswerSubmitRequest {
    
    @NotBlank(message = "Audio file key is required")
    private String audioFileKey;
    
    @NotBlank(message = "Content type is required")
    private String contentType;
}
