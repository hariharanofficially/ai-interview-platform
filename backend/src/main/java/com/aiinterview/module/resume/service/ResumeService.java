package com.aiinterview.module.resume.service;

import com.aiinterview.common.exception.ResourceNotFoundException;
import com.aiinterview.module.auth.entity.User;
import com.aiinterview.module.auth.repository.UserRepository;
import com.aiinterview.module.resume.dto.ResumeResponse;
import com.aiinterview.module.resume.dto.ResumeUploadConfirmRequest;
import com.aiinterview.module.resume.entity.Resume;
import com.aiinterview.module.resume.repository.ResumeRepository;
import com.aiinterview.module.user.dto.PresignedUrlResponse;
import com.aiinterview.module.user.service.S3StorageService;
import com.aiinterview.module.ai.service.AiEngineService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final S3StorageService s3StorageService;
    private final DocumentParsingService documentParsingService;
    private final AiEngineService aiEngineService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PresignedUrlResponse generateUploadUrl(UUID userId, String contentType) {
        String directory = "resumes/" + userId.toString();
        return s3StorageService.generateUploadUrl(contentType, directory);
    }

    @Transactional
    public ResumeResponse processResume(UUID userId, ResumeUploadConfirmRequest request) {
        log.info("Processing resume for user {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Download document from S3
        String rawText;
        try (InputStream is = s3StorageService.getObjectAsInputStream(request.getFileKey())) {
            // 2. Parse text with Tika
            rawText = documentParsingService.parseDocument(is);
        } catch (Exception e) {
            log.error("Failed to read/parse resume document", e);
            throw new RuntimeException("Failed to process document", e);
        }

        // 3. AI Extraction
        String extractedDataJson = aiEngineService.extractResumeData(rawText);

        // 4. AI Feedback Generation (target role could be passed if we had it, using general for now)
        String aiFeedbackJson = aiEngineService.generateResumeFeedback(rawText, null);

        // 5. Save to DB
        Resume resume = resumeRepository.findByUserId(userId).orElse(new Resume());
        resume.setUser(user);
        
        // Delete old file if updating
        if (resume.getId() != null && resume.getFileKey() != null && !resume.getFileKey().equals(request.getFileKey())) {
            s3StorageService.deleteObject(resume.getFileKey());
        }

        resume.setFileKey(request.getFileKey());
        resume.setOriginalFilename(request.getOriginalFilename());
        resume.setContentType(request.getContentType());
        resume.setFileSize(request.getFileSize());
        resume.setRawText(rawText);
        resume.setExtractedData(extractedDataJson);
        resume.setAiFeedback(aiFeedbackJson);
        resume.setUpdatedAt(Instant.now());

        if (resume.getId() == null) {
            resume.setCreatedAt(Instant.now());
        }

        Resume savedResume = resumeRepository.save(resume);

        return mapToResponse(savedResume);
    }

    @Transactional(readOnly = true)
    public ResumeResponse getMyResume(UUID userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        return mapToResponse(resume);
    }

    private ResumeResponse mapToResponse(Resume resume) {
        String downloadUrl = s3StorageService.generateDownloadUrl(resume.getFileKey());

        Object extractedDataObject = null;
        Object aiFeedbackObject = null;

        try {
            if (resume.getExtractedData() != null) {
                extractedDataObject = objectMapper.readValue(resume.getExtractedData(), new TypeReference<>() {});
            }
            if (resume.getAiFeedback() != null) {
                aiFeedbackObject = objectMapper.readValue(resume.getAiFeedback(), new TypeReference<>() {});
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse JSON for resume {}", resume.getId(), e);
        }

        return ResumeResponse.builder()
                .id(resume.getId())
                .fileKey(resume.getFileKey())
                .originalFilename(resume.getOriginalFilename())
                .downloadUrl(downloadUrl)
                .extractedData(extractedDataObject)
                .aiFeedback(aiFeedbackObject)
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }
}
