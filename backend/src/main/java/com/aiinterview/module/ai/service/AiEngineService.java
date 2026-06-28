package com.aiinterview.module.ai.service;

import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.PartMaker;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiEngineService {

    private final GenerativeModel generativeModel;

    /**
     * Extracts structured JSON data from a raw text resume.
     */
    public String extractResumeData(String rawText) {
        log.info("Extracting structured data from resume using Gemini...");
        
        String prompt = """
                You are an expert HR parsing system.
                I will provide you with the raw text extracted from a candidate's resume.
                Your task is to extract the data and format it into a STRICT JSON object.
                Do NOT include any markdown formatting, code blocks, or extra text. JUST return the JSON.
                
                The JSON schema must be exactly this:
                {
                  "basics": {
                    "name": "string",
                    "email": "string",
                    "phone": "string",
                    "location": "string"
                  },
                  "summary": "string",
                  "experience": [
                    {
                      "company": "string",
                      "role": "string",
                      "startDate": "string",
                      "endDate": "string",
                      "description": ["string"]
                    }
                  ],
                  "education": [
                    {
                      "institution": "string",
                      "degree": "string",
                      "startDate": "string",
                      "endDate": "string"
                    }
                  ],
                  "skills": ["string"]
                }
                
                Here is the resume text:
                ---
                %s
                ---
                """.formatted(rawText);

        try {
            GenerateContentResponse response = generativeModel.generateContent(prompt);
            String jsonResult = ResponseHandler.getText(response);
            
            // Clean up if Gemini accidentally wraps in markdown
            if (jsonResult.startsWith("```json")) {
                jsonResult = jsonResult.substring(7);
            }
            if (jsonResult.endsWith("```")) {
                jsonResult = jsonResult.substring(0, jsonResult.length() - 3);
            }
            
            log.info("Successfully extracted data via Gemini");
            return jsonResult.trim();
        } catch (IOException e) {
            log.error("Failed to generate content from Gemini", e);
            throw new RuntimeException("AI processing failed", e);
        }
    }

    /**
     * Generates feedback and suggestions for a resume based on a target role.
     */
    public String generateResumeFeedback(String rawText, String targetRole) {
        log.info("Generating AI feedback for target role: {}", targetRole);
        
        String roleContext = (targetRole != null && !targetRole.isBlank()) 
                ? "The candidate is targeting the role of: " + targetRole 
                : "The candidate has not specified a target role, assess it generally.";

        String prompt = """
                You are an expert technical recruiter and resume coach.
                %s
                
                I will provide you with the raw text extracted from a candidate's resume.
                Critique the resume and provide actionable suggestions to improve it.
                Return the result as a STRICT JSON object without any markdown wrapping.
                
                The JSON schema must be exactly this:
                {
                  "overallScore": number (0-100),
                  "strengths": ["string"],
                  "weaknesses": ["string"],
                  "improvedSummary": "string (a suggested better summary)",
                  "bulletPointSuggestions": [
                    {
                      "original": "string (the original bullet point)",
                      "suggested": "string (the improved bullet point emphasizing impact and metrics)"
                    }
                  ]
                }
                
                Here is the resume text:
                ---
                %s
                ---
                """.formatted(roleContext, rawText);

        try {
            GenerateContentResponse response = generativeModel.generateContent(prompt);
            String jsonResult = ResponseHandler.getText(response);
            
            if (jsonResult.startsWith("```json")) {
                jsonResult = jsonResult.substring(7);
            }
            if (jsonResult.endsWith("```")) {
                jsonResult = jsonResult.substring(0, jsonResult.length() - 3);
            }
            
            log.info("Successfully generated feedback via Gemini");
            return jsonResult.trim();
        } catch (IOException e) {
            log.error("Failed to generate feedback from Gemini", e);
            throw new RuntimeException("AI processing failed", e);
        }
    }

    /**
     * Generates a list of tailored interview questions based on the resume and target role.
     */
    public String generateInterviewQuestions(String targetRole, String difficulty, String resumeText, int count) {
        log.info("Generating {} interview questions for role: {}, difficulty: {}", count, targetRole, difficulty);

        String prompt = """
                You are an expert technical interviewer at a top-tier tech company.
                I will provide you with a candidate's parsed resume data.
                Your task is to generate %d personalized interview questions tailored to the candidate's background and the target role.
                
                Target Role: %s
                Difficulty Level: %s
                
                The questions should be a mix of technical deep-dives (based on their listed skills/experience) and behavioral questions.
                
                Return the result as a STRICT JSON array of objects, without any markdown wrapping.
                The JSON schema must be exactly this:
                [
                  {
                    "questionText": "string (the interview question to ask)",
                    "expectedKeyPoints": ["string", "string"] (list of concepts or keywords you expect in a good answer)
                  }
                ]
                
                Here is the candidate's resume text:
                ---
                %s
                ---
                """.formatted(count, targetRole, difficulty, resumeText);

        try {
            GenerateContentResponse response = generativeModel.generateContent(prompt);
            String jsonResult = ResponseHandler.getText(response);

            if (jsonResult.startsWith("```json")) {
                jsonResult = jsonResult.substring(7);
            }
            if (jsonResult.endsWith("```")) {
                jsonResult = jsonResult.substring(0, jsonResult.length() - 3);
            }

            log.info("Successfully generated interview questions via Gemini");
            return jsonResult.trim();
        } catch (IOException e) {
            log.error("Failed to generate interview questions from Gemini", e);
            throw new RuntimeException("AI processing failed", e);
        }
    }

    /**
     * Evaluates a candidate's spoken answer using Gemini's native multimodal capabilities.
     * It transcribes the audio and provides a score/feedback in a single pass.
     */
    public String evaluateAudioAnswer(byte[] audioData, String mimeType, String questionText, String expectedKeyPoints) {
        log.info("Evaluating audio answer ({} bytes, type: {})", audioData.length, mimeType);

        String prompt = """
                You are an expert technical interviewer evaluating a candidate's spoken answer.
                You have been provided with an audio recording of the candidate's response.
                
                Question Asked: %s
                Expected Key Concepts: %s
                
                Please listen to the audio and do two things:
                1. Transcribe the candidate's answer accurately.
                2. Evaluate their answer against the question and expected concepts.
                
                Return the result as a STRICT JSON object without any markdown wrapping.
                The JSON schema must be exactly this:
                {
                  "transcript": "string (the full text of what the candidate said)",
                  "score": number (0 to 100, representing the quality and correctness of the answer),
                  "feedback": "string (constructive feedback on what they did well and what they missed)"
                }
                """.formatted(questionText, expectedKeyPoints);

        try {
            GenerateContentResponse response = generativeModel.generateContent(
                ContentMaker.fromMultiModalData(
                    PartMaker.fromMimeTypeAndData(mimeType, audioData),
                    prompt
                )
            );
            
            String jsonResult = ResponseHandler.getText(response);

            if (jsonResult.startsWith("```json")) {
                jsonResult = jsonResult.substring(7);
            }
            if (jsonResult.endsWith("```")) {
                jsonResult = jsonResult.substring(0, jsonResult.length() - 3);
            }

            log.info("Successfully evaluated audio answer via Gemini");
            return jsonResult.trim();
        } catch (Exception e) {
            log.error("Failed to evaluate audio answer from Gemini", e);
            throw new RuntimeException("AI audio evaluation failed", e);
        }
    }
}
