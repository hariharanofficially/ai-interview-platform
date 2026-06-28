package com.aiinterview.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@Slf4j
public class S3Config {

    @Value("${app.storage.provider}")
    private String provider;

    @Value("${app.storage.s3.region}")
    private String s3Region;

    @Value("${app.storage.minio.url}")
    private String minioUrl;

    @Value("${app.storage.minio.access-key}")
    private String minioAccessKey;

    @Value("${app.storage.minio.secret-key}")
    private String minioSecretKey;

    @Bean
    public S3Client s3Client() {
        if ("minio".equalsIgnoreCase(provider)) {
            log.info("Configuring S3Client for MinIO at {}", minioUrl);
            AwsBasicCredentials credentials = AwsBasicCredentials.create(minioAccessKey, minioSecretKey);
            return S3Client.builder()
                    .endpointOverride(URI.create(minioUrl))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .region(Region.US_EAST_1) // MinIO typically ignores region, but SDK requires it
                    .forcePathStyle(true) // Required for MinIO
                    .build();
        } else {
            log.info("Configuring S3Client for AWS S3 in region {}", s3Region);
            return S3Client.builder()
                    .region(Region.of(s3Region))
                    .credentialsProvider(DefaultCredentialsProvider.create()) // Uses AWS IAM or ENV vars
                    .build();
        }
    }

    @Bean
    public S3Presigner s3Presigner() {
        if ("minio".equalsIgnoreCase(provider)) {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(minioAccessKey, minioSecretKey);
            return S3Presigner.builder()
                    .endpointOverride(URI.create(minioUrl))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .region(Region.US_EAST_1)
                    .build();
        } else {
            return S3Presigner.builder()
                    .region(Region.of(s3Region))
                    .credentialsProvider(DefaultCredentialsProvider.create())
                    .build();
        }
    }
}
