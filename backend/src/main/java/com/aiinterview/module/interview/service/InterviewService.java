package com.aiinterview.module.interview.service;

import com.aiinterview.common.exception.ResourceNotFoundException;
import com.aiinterview.module.auth.entity.User;
import com.aiinterview.module.user.service.S3StorageService;
import com.aiinterview.module.auth.repository.UserRepository;
import com.aiinterview.module.interview.dto.InterviewQuestionResponse;
import com.aiinterview.module.interview.dto.InterviewSessionResponse;
import com.aiinterview.module.interview.dto.InterviewSetupRequest;
import com.aiinterview.module.interview.entity.InterviewQuestion;
import com.aiinterview.module.interview.entity.InterviewSession;
import com.aiinterview.module.interview.repository.InterviewQuestionRepository;
import com.aiinterview.module.interview.repository.InterviewSessionRepository;
import com.aiinterview.module.resume.entity.Resume;
import com.aiinterview.module.resume.repository.ResumeRepository;
import com.aiinterview.module.ai.service.AiEngineService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AiEngineService aiEngineService;
    private final ObjectMapper objectMapper;
    private final S3StorageService s3StorageService;

    @Transactional
    public InterviewSessionResponse setupInterview(UUID userId, InterviewSetupRequest request) {
        log.info("Setting up new interview session for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get the candidate's parsed resume for context
        String resumeText = "No resume provided. Ask general questions for this role.";
        Resume resume = resumeRepository.findByUserId(userId).orElse(null);
        if (resume != null && resume.getExtractedData() != null) {
            resumeText = resume.getExtractedData();
        } else if (resume != null && resume.getRawText() != null) {
            resumeText = resume.getRawText();
        }

        // Generate questions using Gemini
        String generatedQuestionsJson = aiEngineService.generateInterviewQuestions(
                request.getTargetRole(),
                request.getDifficulty(),
                resumeText,
                request.getQuestionCount()
        );

        // Parse JSON array of questions
        List<Map<String, Object>> parsedQuestions;
        try {
            parsedQuestions = objectMapper.readValue(generatedQuestionsJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse Gemini generated questions", e);
            throw new RuntimeException("Failed to generate questions. AI output was invalid.");
        }

        // Create Session
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .targetRole(request.getTargetRole())
                .difficulty(request.getDifficulty())
                .status("SETUP")
                .build();
        
        session = sessionRepository.save(session);

        // Create Questions
        List<InterviewQuestion> questions = new ArrayList<>();
        int order = 1;
        for (Map<String, Object> pq : parsedQuestions) {
            String qText = (String) pq.get("questionText");
            Object keyPointsObj = pq.get("expectedKeyPoints");
            
            String keyPointsStr = null;
            try {
                if (keyPointsObj != null) {
                    keyPointsStr = objectMapper.writeValueAsString(keyPointsObj);
                }
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize key points", e);
            }

            InterviewQuestion question = InterviewQuestion.builder()
                    .session(session)
                    .questionText(qText)
                    .expectedKeyPoints(keyPointsStr)
                    .orderIndex(order++)
                    .build();
            
            questions.add(questionRepository.save(question));
        }

        session.setQuestions(questions);
        return mapToResponse(session);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getMyInterviews(UUID userId) {
        return sessionRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getInterviewSession(UUID sessionId, UUID userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));
        
        if (!session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found"); // Avoid 403 leaking existence
        }

        return mapToResponse(session);
    }

    private InterviewSessionResponse mapToResponse(InterviewSession session) {
        List<InterviewQuestionResponse> questionResponses = session.getQuestions().stream()
                .map(q -> {
                    Object keyPoints = null;
                    if (q.getExpectedKeyPoints() != null) {
                        try {
                            keyPoints = objectMapper.readValue(q.getExpectedKeyPoints(), new TypeReference<>() {});
                        } catch (JsonProcessingException e) {
                            log.warn("Could not parse key points for question {}", q.getId());
                        }
                    }

                    return InterviewQuestionResponse.builder()
                            .id(q.getId())
                            .questionText(q.getQuestionText())
                            .orderIndex(q.getOrderIndex())
                            .expectedKeyPoints(keyPoints)
                            .aiFeedback(q.getAiFeedback())
                            .score(q.getScore())
                            .build();
                })
                .collect(Collectors.toList());

        return InterviewSessionResponse.builder()
                .id(session.getId())
                .targetRole(session.getTargetRole())
                .difficulty(session.getDifficulty())
                .status(session.getStatus())
                .overallScore(session.getOverallScore())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .createdAt(session.getCreatedAt())
                .questions(questionResponses)
                .build();
    }

    @Transactional
    public InterviewQuestionResponse submitAnswer(UUID sessionId, UUID questionId, UUID userId, String audioFileKey, String contentType) {
        log.info("Submitting answer for question {} in session {}", questionId, sessionId);

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        if (!session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Session not found");
        }

        InterviewQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (!question.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Question does not belong to this session");
        }

        if ("SETUP".equals(session.getStatus())) {
            session.setStatus("IN_PROGRESS");
            session.setStartedAt(Instant.now());
            sessionRepository.save(session);
        }

        // 1. Download audio bytes from S3
        byte[] audioBytes;
        try (java.io.InputStream is = s3StorageService.getObjectAsInputStream(audioFileKey)) {
            audioBytes = is.readAllBytes();
        } catch (Exception e) {
            log.error("Failed to read audio file from storage", e);
            throw new RuntimeException("Failed to read audio file", e);
        }

        // 2. Evaluate using Gemini
        String expectedKeyPoints = question.getExpectedKeyPoints() != null ? question.getExpectedKeyPoints() : "[]";
        String aiResultJson = aiEngineService.evaluateAudioAnswer(
                audioBytes, 
                contentType, 
                question.getQuestionText(), 
                expectedKeyPoints
        );

        // 3. Parse and save result
        try {
            Map<String, Object> result = objectMapper.readValue(aiResultJson, new TypeReference<>() {});
            
            question.setUserAnswerAudioKey(audioFileKey);
            question.setUserAnswerTranscript((String) result.get("transcript"));
            question.setAiFeedback((String) result.get("feedback"));
            question.setScore(((Number) result.getOrDefault("score", 0)).intValue());
            
            question = questionRepository.save(question);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse Gemini evaluation result", e);
            throw new RuntimeException("Failed to parse AI evaluation");
        }

        // 4. Check if session is complete (all questions answered)
        boolean allAnswered = session.getQuestions().stream()
                .allMatch(q -> q.getScore() != null || q.getId().equals(questionId));

        if (allAnswered) {
            session.setStatus("COMPLETED");
            session.setCompletedAt(Instant.now());
            
            // Calculate overall average score
            double avg = session.getQuestions().stream()
                    .mapToInt(q -> q.getScore() != null ? q.getScore() : 0)
                    .average()
                    .orElse(0);
            session.setOverallScore((int) avg);
            
            sessionRepository.save(session);
        }

        // Return updated question
        return mapToResponse(session).getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow();
    }
}
