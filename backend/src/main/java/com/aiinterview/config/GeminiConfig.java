package com.aiinterview.config;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
@Slf4j
public class GeminiConfig {

    @Value("${app.gemini.project-id}")
    private String projectId;

    @Value("${app.gemini.location}")
    private String location;

    @Value("${app.gemini.model}")
    private String modelName;

    @Bean
    public VertexAI vertexAI() throws IOException {
        log.info("Initializing Vertex AI Client for Project: {}, Location: {}", projectId, location);
        // By default, this uses Google Application Default Credentials (ADC)
        // Ensure you have run `gcloud auth application-default login`
        // or set GOOGLE_APPLICATION_CREDENTIALS environment variable.
        return new VertexAI(projectId, location);
    }

    @Bean
    public GenerativeModel generativeModel(VertexAI vertexAI) {
        log.info("Initializing GenerativeModel: {}", modelName);
        return new GenerativeModel(modelName, vertexAI);
    }
}
