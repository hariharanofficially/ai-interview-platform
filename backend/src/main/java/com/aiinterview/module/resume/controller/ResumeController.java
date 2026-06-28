package com.aiinterview.module.resume.controller;

import com.aiinterview.common.response.ApiResponse;
import com.aiinterview.module.resume.dto.ResumeResponse;
import com.aiinterview.module.resume.dto.ResumeUploadConfirmRequest;
import com.aiinterview.module.resume.service.ResumeService;
import com.aiinterview.module.user.dto.PresignedUrlResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume Management", description = "Endpoints for uploading and AI processing of resumes")
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload-url")
    @Operation(summary = "Request a presigned URL to upload a resume (PDF/Word)")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> requestUploadUrl(
            @AuthenticationPrincipal UUID userId,
            @RequestParam String contentType) {
        
        if (!contentType.equals("application/pdf") && 
            !contentType.equals("application/msword") && 
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only PDF and Word documents are supported"));
        }

        PresignedUrlResponse response = resumeService.generateUploadUrl(userId, contentType);
        return ResponseEntity.ok(ApiResponse.success("Presigned URL generated", response));
    }

    @PostMapping("/process")
    @Operation(summary = "Process uploaded resume (Parse with Tika, analyze with Gemini)")
    public ResponseEntity<ApiResponse<ResumeResponse>> processResume(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ResumeUploadConfirmRequest request) {
        
        ResumeResponse response = resumeService.processResume(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Resume processed successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user's processed resume and AI feedback")
    public ResponseEntity<ApiResponse<ResumeResponse>> getMyResume(@AuthenticationPrincipal UUID userId) {
        ResumeResponse response = resumeService.getMyResume(userId);
        return ResponseEntity.ok(ApiResponse.success("Resume retrieved successfully", response));
    }
}
