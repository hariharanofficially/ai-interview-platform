package com.aiinterview.module.user.service;

import com.aiinterview.common.exception.ResourceNotFoundException;
import com.aiinterview.module.auth.entity.User;
import com.aiinterview.module.auth.repository.UserRepository;
import com.aiinterview.module.user.dto.ChangePasswordRequest;
import com.aiinterview.module.user.dto.PhotoUploadConfirmRequest;
import com.aiinterview.module.user.dto.PresignedUrlResponse;
import com.aiinterview.module.user.dto.UserProfileResponse;
import com.aiinterview.module.user.dto.UserProfileUpdateRequest;
import com.aiinterview.module.user.entity.UserProfile;
import com.aiinterview.module.user.repository.UserProfileRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final S3StorageService s3StorageService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        return mapToProfileResponse(user, profile);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(UUID userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        // Update User table if name changed
        boolean userUpdated = false;
        if (request.getFirstName() != null && !request.getFirstName().equals(user.getFirstName())) {
            user.setFirstName(request.getFirstName());
            userUpdated = true;
        }
        if (request.getLastName() != null && !request.getLastName().equals(user.getLastName())) {
            user.setLastName(request.getLastName());
            userUpdated = true;
        }
        if (userUpdated) {
            userRepository.save(user);
        }

        // Update Profile table
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getYearsExperience() != null) profile.setYearsExperience(request.getYearsExperience());
        if (request.getCurrentRole() != null) profile.setCurrentRole(request.getCurrentRole());
        if (request.getTargetRole() != null) profile.setTargetRole(request.getTargetRole());

        // Handle skills (List<String> -> JSON String)
        if (request.getSkills() != null) {
            try {
                profile.setSkills(objectMapper.writeValueAsString(request.getSkills()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize skills for user {}: {}", userId, e.getMessage());
                profile.setSkills("[]");
            }
        }

        profile.setUpdatedAt(Instant.now());
        UserProfile savedProfile = userProfileRepository.save(profile);

        return mapToProfileResponse(user, savedProfile);
    }

    @Transactional(readOnly = true)
    public PresignedUrlResponse generatePhotoUploadUrl(UUID userId, String contentType) {
        // Enforce valid content type (handled in controller too)
        String directory = "profiles/" + userId.toString();
        return s3StorageService.generateUploadUrl(contentType, directory);
    }

    @Transactional
    public void confirmPhotoUpload(UUID userId, PhotoUploadConfirmRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        // Delete old photo from S3 if exists
        if (profile.getPhotoKey() != null && !profile.getPhotoKey().isBlank()) {
            s3StorageService.deleteObject(profile.getPhotoKey());
        }

        // Assuming S3 object is public read. MinIO/S3 domain needs to be prefixed if not returning full URL.
        // For simplicity, we just store the key and generate the URL via our service, or assume public bucket.
        // Let's store a generic download URL if public, or use S3StorageService for presigned GET.
        
        // Actually, if we use MinIO, a public URL is ideal. Let's just store the presigned download URL for now,
        // or a fixed format public URL if bucket is public.
        // For this demo, we can just use the presigned GET URL with a long expiry, or generate on the fly.
        // Let's generate it on the fly when mapping to response, and just store the key in DB.
        
        profile.setPhotoKey(request.getKey());
        profile.setUpdatedAt(Instant.now());
        userProfileRepository.save(profile);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        userRepository.updatePassword(userId, passwordEncoder.encode(request.getNewPassword()));
    }

    private UserProfileResponse mapToProfileResponse(User user, UserProfile profile) {
        List<String> skillsList = Collections.emptyList();
        try {
            if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
                skillsList = objectMapper.readValue(profile.getSkills(), new TypeReference<>() {});
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize skills for user {}: {}", user.getId(), e.getMessage());
        }

        String photoUrl = null;
        if (profile.getPhotoKey() != null && !profile.getPhotoKey().isBlank()) {
            photoUrl = s3StorageService.generateDownloadUrl(profile.getPhotoKey());
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .photoUrl(photoUrl)
                .yearsExperience(profile.getYearsExperience())
                .currentRole(profile.getCurrentRole())
                .targetRole(profile.getTargetRole())
                .skills(skillsList)
                .build();
    }
}
