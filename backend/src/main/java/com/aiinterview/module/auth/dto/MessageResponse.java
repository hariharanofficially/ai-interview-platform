package com.aiinterview.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Generic message-only response for operations that don't return data.
 * Examples: logout, resend verification, forgot password confirmation.
 */
@Data
@AllArgsConstructor
public class MessageResponse {
    private String message;
}
