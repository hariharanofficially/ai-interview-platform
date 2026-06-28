package com.aiinterview.module.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private UUID id;
    private String fileKey;
    private String originalFilename;
    private String downloadUrl; // Presigned GET url
    private Object extractedData; // Typed as Object for dynamic JSON return in Spring MVC
    private Object aiFeedback;
    private Instant createdAt;
    private Instant updatedAt;
}
