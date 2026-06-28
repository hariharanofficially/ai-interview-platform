package com.aiinterview.module.auth.service;

import com.aiinterview.common.exception.EmailAlreadyExistsException;
import com.aiinterview.common.exception.InvalidTokenException;
import com.aiinterview.common.exception.TokenExpiredException;
import com.aiinterview.common.util.JwtUtil;
import com.aiinterview.module.auth.dto.*;
import com.aiinterview.module.auth.entity.*;
import com.aiinterview.module.auth.repository.*;
import com.aiinterview.module.user.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private EmailVerificationRepository emailVerificationRepository;
    @Mock private PasswordResetRepository passwordResetRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpirationMs",   900000L);
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationMs",  604800000L);
        ReflectionTestUtils.setField(authService, "verificationExpiryHours",   24);
        ReflectionTestUtils.setField(authService, "passwordResetExpiryHours",  1);
    }

    // ── Registration ─────────────────────────────────────────────────

    @Nested
    @DisplayName("Registration")
    class RegistrationTests {

        @Test
        @DisplayName("Should register new user successfully")
        void register_success() {
            RegisterRequest request = new RegisterRequest();
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setEmail("john@example.com");
            request.setPassword("Password1!");

            given(userRepository.existsByEmailIgnoreCase("john@example.com")).willReturn(false);
            given(passwordEncoder.encode("Password1!")).willReturn("hashedPwd");

            User savedUser = User.builder().id(UUID.randomUUID()).email("john@example.com")
                    .firstName("John").lastName("Doe").build();
            given(userRepository.save(any(User.class))).willReturn(savedUser);
            given(emailVerificationRepository.save(any())).willReturn(null);

            authService.register(request);

            then(userRepository).should().save(any(User.class));
            then(emailVerificationRepository).should().save(any(EmailVerification.class));
            then(emailService).should().sendVerificationEmail(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw when email already exists")
        void register_emailExists_throwsConflict() {
            RegisterRequest request = new RegisterRequest();
            request.setEmail("existing@example.com");
            request.setPassword("Password1!");
            request.setFirstName("Test");
            request.setLastName("User");

            given(userRepository.existsByEmailIgnoreCase("existing@example.com")).willReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(EmailAlreadyExistsException.class);

            then(userRepository).should(never()).save(any());
        }

        @Test
        @DisplayName("Should normalize email to lowercase on registration")
        void register_normalizesEmailToLowercase() {
            RegisterRequest request = new RegisterRequest();
            request.setEmail("John.DOE@Example.COM");
            request.setPassword("Password1!");
            request.setFirstName("John");
            request.setLastName("Doe");

            given(userRepository.existsByEmailIgnoreCase("john.doe@example.com")).willReturn(false);
            given(passwordEncoder.encode(any())).willReturn("hash");
            given(userRepository.save(any())).willReturn(User.builder().id(UUID.randomUUID())
                    .email("john.doe@example.com").build());
            given(emailVerificationRepository.save(any())).willReturn(null);

            authService.register(request);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            then(userRepository).should().save(userCaptor.capture());
            assertThat(userCaptor.getValue().getEmail()).isEqualTo("john.doe@example.com");
        }
    }

    // ── Email Verification ────────────────────────────────────────────

    @Nested
    @DisplayName("Email Verification")
    class EmailVerificationTests {

        @Test
        @DisplayName("Should verify email with valid token")
        void verifyEmail_validToken_success() {
            String token = UUID.randomUUID().toString();
            User user    = User.builder().id(UUID.randomUUID()).email("test@example.com").build();
            EmailVerification ev = EmailVerification.builder()
                    .token(token).user(user).used(false)
                    .expiresAt(Instant.now().plusSeconds(3600)).build();

            given(emailVerificationRepository.findByToken(token)).willReturn(Optional.of(ev));

            authService.verifyEmail(token);

            assertThat(ev.isUsed()).isTrue();
            then(userRepository).should().markEmailVerified(user.getId());
        }

        @Test
        @DisplayName("Should throw InvalidTokenException for unknown token")
        void verifyEmail_unknownToken_throwsInvalid() {
            given(emailVerificationRepository.findByToken("bad-token")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.verifyEmail("bad-token"))
                    .isInstanceOf(InvalidTokenException.class);
        }

        @Test
        @DisplayName("Should throw TokenExpiredException for expired token")
        void verifyEmail_expiredToken_throwsExpired() {
            String token = UUID.randomUUID().toString();
            User user    = User.builder().id(UUID.randomUUID()).build();
            EmailVerification ev = EmailVerification.builder()
                    .token(token).user(user).used(false)
                    .expiresAt(Instant.now().minusSeconds(3600)).build(); // expired

            given(emailVerificationRepository.findByToken(token)).willReturn(Optional.of(ev));

            assertThatThrownBy(() -> authService.verifyEmail(token))
                    .isInstanceOf(TokenExpiredException.class);
        }
    }

    // ── Token Refresh ─────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Refresh")
    class TokenRefreshTests {

        @Test
        @DisplayName("Should revoke all tokens when revoked token is reused (replay attack)")
        void refreshToken_revokedTokenReuse_revokesAll() {
            User user    = User.builder().id(UUID.randomUUID()).email("test@example.com").build();
            RefreshToken revokedToken = RefreshToken.builder()
                    .token("revoked-token").user(user).revoked(true)
                    .expiresAt(Instant.now().plusSeconds(3600)).build();

            given(refreshTokenRepository.findByToken("revoked-token")).willReturn(Optional.of(revokedToken));

            assertThatThrownBy(() -> authService.refreshToken(
                    buildRefreshRequest("revoked-token"), null))
                    .isInstanceOf(InvalidTokenException.class);

            then(refreshTokenRepository).should().revokeAllUserTokens(user.getId());
        }
    }

    // ── Password Reset ────────────────────────────────────────────────

    @Nested
    @DisplayName("Password Reset")
    class PasswordResetTests {

        @Test
        @DisplayName("Should never reveal if email exists (user enumeration prevention)")
        void forgotPassword_unknownEmail_noException() {
            given(userRepository.findByEmailIgnoreCase("unknown@example.com")).willReturn(Optional.empty());

            // Should complete without exception
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("unknown@example.com");
            assertThatCode(() -> authService.forgotPassword(request)).doesNotThrowAnyException();
            then(emailService).should(never()).sendPasswordResetEmail(any(), any(), any());
        }

        @Test
        @DisplayName("Should fail when passwords do not match")
        void resetPassword_passwordMismatch_throwsApiException() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("some-token");
            request.setNewPassword("Password1!");
            request.setConfirmPassword("DifferentPass1!");

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(com.aiinterview.common.exception.ApiException.class)
                    .hasMessageContaining("Passwords do not match");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private RefreshTokenRequest buildRefreshRequest(String token) {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken(token);
        return req;
    }
}
