package com.aiinterview.module.user.controller;

import com.aiinterview.common.response.ApiResponse;
import com.aiinterview.module.user.dto.ChangePasswordRequest;
import com.aiinterview.module.user.dto.PhotoUploadConfirmRequest;
import com.aiinterview.module.user.dto.PresignedUrlResponse;
import com.aiinterview.module.user.dto.UserProfileResponse;
import com.aiinterview.module.user.dto.UserProfileUpdateRequest;
import com.aiinterview.module.user.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for managing user profile and settings")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(@AuthenticationPrincipal UUID userId) {
        UserProfileResponse profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserProfileResponse profile = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PostMapping("/me/photo/upload-url")
    @Operation(summary = "Request a presigned URL to upload a profile photo")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> requestPhotoUploadUrl(
            @AuthenticationPrincipal UUID userId,
            @RequestParam String contentType) {
        // Simple validation
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Content type must be an image"));
        }
        PresignedUrlResponse response = userService.generatePhotoUploadUrl(userId, contentType);
        return ResponseEntity.ok(ApiResponse.success("Presigned URL generated", response));
    }

    @PostMapping("/me/photo/confirm")
    @Operation(summary = "Confirm photo upload and save to profile")
    public ResponseEntity<ApiResponse<Void>> confirmPhotoUpload(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody PhotoUploadConfirmRequest request) {
        userService.confirmPhotoUpload(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Photo updated successfully", null));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
