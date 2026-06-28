package com.aiinterview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the AI Interview Platform backend.
 *
 * <p>Architecture: Layered (Controller → Service → Repository) with
 * feature-based modules under com.aiinterview.module.*
 *
 * <p>Virtual threads (Project Loom / Java 21) are enabled via
 * AsyncConfig to handle high concurrency without thread-pool exhaustion.
 */
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableAsync
@EnableScheduling
public class AiInterviewApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiInterviewApplication.class, args);
    }
}
