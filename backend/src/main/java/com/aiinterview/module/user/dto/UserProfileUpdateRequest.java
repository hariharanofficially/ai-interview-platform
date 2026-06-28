package com.aiinterview.module.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UserProfileUpdateRequest {

    @Size(max = 100, message = "First name must be under 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must be under 100 characters")
    private String lastName;

    @Size(max = 20, message = "Phone must be under 20 characters")
    private String phone;

    @Size(max = 200, message = "Location must be under 200 characters")
    private String location;

    private String bio;

    @Size(max = 500, message = "LinkedIn URL must be under 500 characters")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must be under 500 characters")
    private String githubUrl;

    @Size(max = 500, message = "Portfolio URL must be under 500 characters")
    private String portfolioUrl;

    private Integer yearsExperience;

    @Size(max = 200, message = "Current role must be under 200 characters")
    private String currentRole;

    @Size(max = 200, message = "Target role must be under 200 characters")
    private String targetRole;

    private List<String> skills;
}
