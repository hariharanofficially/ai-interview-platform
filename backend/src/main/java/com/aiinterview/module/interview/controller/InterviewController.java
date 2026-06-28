package com.aiinterview.module.interview.controller;

import com.aiinterview.common.response.ApiResponse;
import com.aiinterview.module.interview.dto.InterviewSessionResponse;
import com.aiinterview.module.interview.dto.InterviewSetupRequest;
import com.aiinterview.module.interview.service.InterviewService;
import com.aiinterview.module.user.dto.PresignedUrlResponse;
import com.aiinterview.module.user.service.S3StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview Management", description = "Endpoints for configuring and retrieving interview sessions")
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;
    private final S3StorageService s3StorageService;

    @PostMapping("/upload-url")
    @Operation(summary = "Request a presigned URL to upload an audio answer")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> requestUploadUrl(
            @AuthenticationPrincipal UUID userId,
            @RequestParam String contentType) {
        
        if (!contentType.startsWith("audio/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only audio files are supported"));
        }

        String directory = "answers/" + userId.toString();
        PresignedUrlResponse response = s3StorageService.generateUploadUrl(contentType, directory);
        return ResponseEntity.ok(ApiResponse.success("Presigned URL generated", response));
    }

    @PostMapping("/setup")
    @Operation(summary = "Set up a new interview and generate AI questions")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> setupInterview(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody InterviewSetupRequest request) {
        
        InterviewSessionResponse response = interviewService.setupInterview(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Interview setup successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all interview sessions for the current user")
    public ResponseEntity<ApiResponse<List<InterviewSessionResponse>>> getMyInterviews(
            @AuthenticationPrincipal UUID userId) {
        
        List<InterviewSessionResponse> responses = interviewService.getMyInterviews(userId);
        return ResponseEntity.ok(ApiResponse.success("Interviews retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific interview session by ID")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> getInterviewSession(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        
        InterviewSessionResponse response = interviewService.getInterviewSession(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Interview retrieved successfully", response));
    }

    @PostMapping("/{sessionId}/questions/{questionId}/answer")
    @Operation(summary = "Submit an audio answer for a specific question")
    public ResponseEntity<ApiResponse<com.aiinterview.module.interview.dto.InterviewQuestionResponse>> submitAnswer(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID sessionId,
            @PathVariable UUID questionId,
            @Valid @RequestBody com.aiinterview.module.interview.dto.AnswerSubmitRequest request) {
        
        com.aiinterview.module.interview.dto.InterviewQuestionResponse response = 
                interviewService.submitAnswer(sessionId, questionId, userId, request.getAudioFileKey(), request.getContentType());
        
        return ResponseEntity.ok(ApiResponse.success("Answer evaluated successfully", response));
    }
}
