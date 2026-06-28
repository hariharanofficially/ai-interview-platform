package com.aiinterview.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger configuration.
 *
 * <p>Accessible at:
 * <ul>
 *   <li>Swagger UI: /swagger-ui.html</li>
 *   <li>OpenAPI JSON: /api-docs</li>
 * </ul>
 *
 * <p>JWT Bearer token authentication is preconfigured in the Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    @Value("${app.frontend-url}")
    private String serverUrl;

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("AI Interview Platform API")
                        .description("Production-ready REST API for the AI Interview Platform. " +
                                "Supports candidate registration, mock interviews, coding challenges, " +
                                "resume analysis, and admin management.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("AI Interview Platform")
                                .email("support@aiinterview.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://aiinterview.com/terms")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.aiinterview.com").description("Production")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Provide a valid JWT access token obtained from POST /api/v1/auth/login")));
    }
}
