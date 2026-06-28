package com.aiinterview.module.user.service;

import com.aiinterview.module.user.dto.PresignedUrlResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${app.storage.provider}")
    private String provider;

    @Value("${app.storage.s3.bucket}")
    private String s3Bucket;

    @Value("${app.storage.minio.bucket}")
    private String minioBucket;

    @Value("${app.storage.s3.presigned-url-expiry-minutes}")
    private long urlExpiryMinutes;

    private String getBucketName() {
        return "minio".equalsIgnoreCase(provider) ? minioBucket : s3Bucket;
    }

    /**
     * Generates a presigned URL for a client to upload a file directly to S3/MinIO.
     *
     * @param contentType The MIME type of the file being uploaded (e.g., "image/jpeg").
     * @param directory   The directory prefix in the bucket (e.g., "profiles").
     * @return PresignedUrlResponse containing the URL and the generated object key.
     */
    public PresignedUrlResponse generateUploadUrl(String contentType, String directory) {
        String ext = getExtension(contentType);
        String key = directory + "/" + UUID.randomUUID().toString() + ext;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(getBucketName())
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(urlExpiryMinutes))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        log.debug("Generated presigned PUT URL for key: {}", key);

        return PresignedUrlResponse.builder()
                .url(presignedRequest.url().toString())
                .key(key)
                .method("PUT")
                .expiresInSeconds(urlExpiryMinutes * 60)
                .build();
    }

    /**
     * Generates a presigned URL to view/download a private file.
     * Not needed if the bucket is public-read for profile photos, but useful for private resumes.
     *
     * @param key The object key.
     * @return The presigned URL as a string.
     */
    public String generateDownloadUrl(String key) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(getBucketName())
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(urlExpiryMinutes))
                .getObjectRequest(objectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    /**
     * Deletes an object from the bucket. Used when replacing an old profile photo.
     *
     * @param key The object key to delete.
     */
    public void deleteObject(String key) {
        if (key == null || key.isBlank()) return;

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.debug("Deleted object {} from bucket {}", key, getBucketName());
        } catch (Exception e) {
            log.error("Failed to delete object {} from bucket {}: {}", key, getBucketName(), e.getMessage());
        }
    }

    /**
     * Retrieves an object from the bucket as an InputStream.
     *
     * @param key The object key.
     * @return InputStream of the object content.
     */
    public java.io.InputStream getObjectAsInputStream(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(getBucketName())
                .key(key)
                .build();
        return s3Client.getObject(getObjectRequest);
    }

    private String getExtension(String contentType) {
        if (contentType == null) return "";
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "application/pdf" -> ".pdf";
            case "application/msword" -> ".doc";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> ".docx";
            default -> "";
        };
    }
}
