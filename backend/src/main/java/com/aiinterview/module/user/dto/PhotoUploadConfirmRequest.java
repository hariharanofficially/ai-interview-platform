package com.aiinterview.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhotoUploadConfirmRequest {

    @NotBlank(message = "Key is required")
    private String key;
}
