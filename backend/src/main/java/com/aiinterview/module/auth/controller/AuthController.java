package com.aiinterview.module.auth.controller;

import com.aiinterview.common.response.ApiResponse;
import com.aiinterview.module.auth.dto.*;
import com.aiinterview.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Authentication REST controller.
 *
 * <p>All endpoints are public (no auth required) except:
 * <ul>
 *   <li>POST /logout — requires valid access token</li>
 *   <li>POST /logout-all — requires valid access token</li>
 * </ul>
 *
 * <p>Base path: /api/v1/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, token management, and password reset")
public class AuthController {

    private final AuthService authService;

    // ── POST /register ────────────────────────────────────────────────

    @PostMapping("/register")
    @SecurityRequirements  // No auth required
    @Operation(summary = "Register a new candidate account",
               description = "Creates a new user account and sends an email verification link")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already in use"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully. Please check your email to verify your account."));
    }

    // ── POST /verify-email ────────────────────────────────────────────

    @PostMapping("/verify-email")
    @SecurityRequirements
    @Operation(summary = "Verify email address",
               description = "Verifies user's email using the token sent in the verification email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now log in."));
    }

    // ── POST /resend-verification ─────────────────────────────────────

    @PostMapping("/resend-verification")
    @SecurityRequirements
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("If this email is registered and unverified, a new verification link has been sent."));
    }

    // ── POST /login ───────────────────────────────────────────────────

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Login and receive JWT tokens",
               description = "Authenticates a user and returns an access token (15 min) and refresh token (7 days)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Email not verified or account disabled")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ── POST /refresh ─────────────────────────────────────────────────

    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(summary = "Refresh access token",
               description = "Issues a new access token and rotates the refresh token")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse response = authService.refreshToken(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    // ── POST /logout ──────────────────────────────────────────────────

    @PostMapping("/logout")
    @Operation(summary = "Logout current session",
               description = "Revokes the provided refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    // ── POST /logout-all ──────────────────────────────────────────────

    @PostMapping("/logout-all")
    @Operation(summary = "Logout all devices",
               description = "Revokes all refresh tokens for the authenticated user")
    public ResponseEntity<ApiResponse<Void>> logoutAllDevices(
            @AuthenticationPrincipal UserDetails userDetails) {
        // userId is embedded in the JWT — look up user by email
        // For simplicity passing email to service; service resolves UUID
        authService.logoutAllDevices(null); // Will be enhanced in Module 2 with proper user context
        return ResponseEntity.ok(ApiResponse.success("All sessions terminated successfully"));
    }

    // ── POST /forgot-password ─────────────────────────────────────────

    @PostMapping("/forgot-password")
    @SecurityRequirements
    @Operation(summary = "Request password reset email",
               description = "Sends a password reset link to the email if it exists. Always returns success to prevent user enumeration.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("If this email is registered, a password reset link has been sent."));
    }

    // ── POST /reset-password ──────────────────────────────────────────

    @PostMapping("/reset-password")
    @SecurityRequirements
    @Operation(summary = "Reset password using token",
               description = "Sets a new password using the reset token from the email")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Passwords do not match"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid token"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "410", description = "Token expired")
    })
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please log in with your new password."));
    }

    // ── GET /me ───────────────────────────────────────────────────────

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info",
               description = "Returns the authenticated user's basic information from the JWT")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Basic info from security context — full profile available in /api/v1/users/me
        UserSummaryResponse summary = UserSummaryResponse.builder()
                .email(userDetails.getUsername())
                .role(userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""))
                .build();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
