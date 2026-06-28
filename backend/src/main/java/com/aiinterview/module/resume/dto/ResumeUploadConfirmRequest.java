package com.aiinterview.module.resume.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResumeUploadConfirmRequest {

    @NotBlank(message = "File key is required")
    private String fileKey;

    @NotBlank(message = "Original filename is required")
    private String originalFilename;

    @NotBlank(message = "Content type is required")
    private String contentType;

    private Long fileSize;
}
