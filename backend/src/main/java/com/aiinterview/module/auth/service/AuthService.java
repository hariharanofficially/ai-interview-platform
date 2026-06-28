package com.aiinterview.module.auth.service;

import com.aiinterview.common.exception.*;
import com.aiinterview.common.util.JwtUtil;
import com.aiinterview.module.auth.dto.*;
import com.aiinterview.module.auth.entity.*;
import com.aiinterview.module.auth.repository.*;
import com.aiinterview.module.user.entity.UserProfile;
import com.aiinterview.module.user.repository.UserProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Core authentication service.
 *
 * <p>Handles the complete auth lifecycle:
 * <ul>
 *   <li>Registration with email verification</li>
 *   <li>Login with JWT + Refresh Token issuance</li>
 *   <li>Token refresh with rotation (old token revoked, new one issued)</li>
 *   <li>Logout (revoke all refresh tokens for device or all devices)</li>
 *   <li>Email verification</li>
 *   <li>Forgot/Reset password</li>
 * </ul>
 *
 * <p>Security decisions:
 * <ul>
 *   <li>Forgot password always returns success to prevent user enumeration</li>
 *   <li>Token replay is detected by checking if a revoked token is reused</li>
 *   <li>Passwords are checked against confirmPassword at service layer</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${app.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Value("${app.email.verification-expiry-hours}")
    private int verificationExpiryHours;

    @Value("${app.email.password-reset-expiry-hours}")
    private int passwordResetExpiryHours;

    // ── Registration ──────────────────────────────────────────────────

    public void register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(Role.CANDIDATE)
                .emailVerified(false)
                .active(true)
                .build();

        userRepository.save(user);

        // Create empty profile
        UserProfile profile = UserProfile.builder()
                .user(user)
                .build();
        userProfileRepository.save(profile);

        // Send verification email
        sendVerificationEmail(user);

        log.info("New user registered: {} [id={}]", email, user.getId());
    }

    // ── Email Verification ────────────────────────────────────────────

    public void verifyEmail(String token) {
        EmailVerification verification = emailVerificationRepository.findByToken(token)
                .orElseThrow(InvalidTokenException::new);

        if (!verification.isValid()) {
            if (verification.isExpired()) throw new TokenExpiredException("Email verification");
            throw new InvalidTokenException("Email verification token has already been used");
        }

        verification.setUsed(true);
        emailVerificationRepository.save(verification);

        userRepository.markEmailVerified(verification.getUser().getId());
        log.info("Email verified for user: {}", verification.getUser().getEmail());
    }

    public void resendVerificationEmail(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                sendVerificationEmail(user);
            }
        });
        // Always return success to prevent user enumeration
    }

    // ── Login ─────────────────────────────────────────────────────────

    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        // Spring Security handles BadCredentialsException and DisabledException
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getEmail()));

        String accessToken  = generateAccessToken(user);
        String refreshToken = createRefreshToken(user, httpRequest);

        log.info("User logged in: {} [id={}]", user.getEmail(), user.getId());
        return buildLoginResponse(accessToken, refreshToken, user);
    }

    // ── Token Refresh ─────────────────────────────────────────────────

    public LoginResponse refreshToken(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(InvalidTokenException::new);

        // Replay attack detection: revoked token presented → revoke all user tokens
        if (storedToken.isRevoked()) {
            log.warn("Revoked refresh token reused for user: {}", storedToken.getUser().getEmail());
            refreshTokenRepository.revokeAllUserTokens(storedToken.getUser().getId());
            throw new InvalidTokenException("Token reuse detected. All sessions have been invalidated.");
        }

        if (storedToken.isExpired()) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new TokenExpiredException("Refresh");
        }

        // Rotate: revoke old, issue new
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();
        String newAccessToken  = generateAccessToken(user);
        String newRefreshToken = createRefreshToken(user, httpRequest);

        return buildLoginResponse(newAccessToken, newRefreshToken, user);
    }

    // ── Logout ────────────────────────────────────────────────────────

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            log.info("User logged out: {}", token.getUser().getEmail());
        });
    }

    public void logoutAllDevices(UUID userId) {
        refreshTokenRepository.revokeAllUserTokens(userId);
        log.info("All sessions revoked for userId: {}", userId);
    }

    // ── Forgot / Reset Password ───────────────────────────────────────

    public void forgotPassword(ForgotPasswordRequest request) {
        // Always succeed — prevents user enumeration
        userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .ifPresent(this::sendPasswordResetEmail);
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException("Passwords do not match", org.springframework.http.HttpStatus.BAD_REQUEST, "PASSWORDS_DO_NOT_MATCH");
        }

        PasswordReset reset = passwordResetRepository.findByToken(request.getToken())
                .orElseThrow(InvalidTokenException::new);

        if (!reset.isValid()) {
            if (reset.isExpired()) throw new TokenExpiredException("Password reset");
            throw new InvalidTokenException("Password reset token has already been used");
        }

        reset.setUsed(true);
        passwordResetRepository.save(reset);

        String newHash = passwordEncoder.encode(request.getNewPassword());
        userRepository.updatePassword(reset.getUser().getId(), newHash);

        // Revoke all refresh tokens (force re-login after password change)
        refreshTokenRepository.revokeAllUserTokens(reset.getUser().getId());

        log.info("Password reset completed for user: {}", reset.getUser().getEmail());
    }

    // ── Private Helpers ───────────────────────────────────────────────

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plusSeconds(verificationExpiryHours * 3600L))
                .build();
        emailVerificationRepository.save(verification);
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);
    }

    private void sendPasswordResetEmail(User user) {
        String token = UUID.randomUUID().toString();
        PasswordReset reset = PasswordReset.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plusSeconds(passwordResetExpiryHours * 3600L))
                .build();
        passwordResetRepository.save(reset);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
    }

    private String generateAccessToken(User user) {
        return jwtUtil.generateAccessToken(
                user.getEmail(), user.getId().toString(), user.getRole().name());
    }

    private String createRefreshToken(User user, HttpServletRequest request) {
        String tokenValue = UUID.randomUUID().toString();
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .ipAddress(request != null ? request.getRemoteAddr() : null)
                .build();
        refreshTokenRepository.save(token);
        return tokenValue;
    }

    private LoginResponse buildLoginResponse(String accessToken, String refreshToken, User user) {
        String photoUrl = (user.getProfile() != null) ? user.getProfile().getPhotoUrl() : null;
        UserSummaryResponse userSummary = UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .photoUrl(photoUrl)
                .createdAt(user.getCreatedAt())
                .build();

        return LoginResponse.of(accessToken, refreshToken, accessTokenExpirationMs, userSummary);
    }
}
