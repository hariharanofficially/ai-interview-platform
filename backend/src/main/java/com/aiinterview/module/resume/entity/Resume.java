package com.aiinterview.module.resume.entity;

import com.aiinterview.module.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "file_key", length = 500, nullable = false)
    private String fileKey;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    /**
     * The raw text extracted by Tika.
     */
    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    /**
     * JSONB containing the structured data extracted by Gemini.
     */
    @Column(name = "extracted_data", columnDefinition = "jsonb")
    private String extractedData;

    /**
     * JSONB containing the AI's feedback, scoring, and suggested improvements.
     */
    @Column(name = "ai_feedback", columnDefinition = "jsonb")
    private String aiFeedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
