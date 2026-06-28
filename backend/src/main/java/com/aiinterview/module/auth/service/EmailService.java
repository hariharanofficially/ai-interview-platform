package com.aiinterview.module.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service for transactional emails.
 *
 * <p>All methods are @Async — emails are sent in virtual threads
 * so auth operations return immediately without waiting for SMTP.
 *
 * <p>HTML templates are inline for simplicity. In production,
 * consider a templating engine (Thymeleaf, FreeMarker) or
 * a transactional email API (SendGrid dynamic templates).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.email.verification-url}")
    private String verificationUrl;

    @Value("${app.email.password-reset-url}")
    private String passwordResetUrl;

    @Async
    public void sendVerificationEmail(String to, String firstName, String token) {
        String verifyLink = verificationUrl + "?token=" + token;
        String subject    = "Verify your AI Interview Platform account";
        String body       = buildVerificationEmailHtml(firstName, verifyLink);
        sendEmail(to, subject, body);
        log.info("Verification email sent to: {}", to);
    }

    @Async
    public void sendPasswordResetEmail(String to, String firstName, String token) {
        String resetLink = passwordResetUrl + "?token=" + token;
        String subject   = "Reset your AI Interview Platform password";
        String body      = buildPasswordResetEmailHtml(firstName, resetLink);
        sendEmail(to, subject, body);
        log.info("Password reset email sent to: {}", to);
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to AI Interview Platform!";
        String body    = buildWelcomeEmailHtml(firstName);
        sendEmail(to, subject, body);
    }

    // ── Private helpers ───────────────────────────────────────────────

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            // Don't rethrow — email failure should not fail the user operation
        }
    }

    private String buildVerificationEmailHtml(String firstName, String verifyLink) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Inter, Arial, sans-serif; background: #0F172A; margin: 0; padding: 40px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #1E293B; border-radius: 16px; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #6366F1; font-size: 28px; margin: 0;">AI Interview Platform</h1>
                    </div>
                    <h2 style="color: #F1F5F9; font-size: 22px;">Verify your email address</h2>
                    <p style="color: #94A3B8; font-size: 16px; line-height: 1.6;">
                      Hi %s,<br><br>
                      Thanks for signing up! Click the button below to verify your email address and get started.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="%s" style="background: #6366F1; color: white; padding: 14px 32px; border-radius: 8px;
                         text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                        Verify Email Address
                      </a>
                    </div>
                    <p style="color: #64748B; font-size: 14px;">
                      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
                    </p>
                    <hr style="border: 1px solid #334155; margin: 32px 0;">
                    <p style="color: #64748B; font-size: 12px; text-align: center;">
                      If the button doesn't work, copy and paste this link: <a href="%s" style="color: #6366F1;">%s</a>
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(firstName, verifyLink, verifyLink, verifyLink);
    }

    private String buildPasswordResetEmailHtml(String firstName, String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Inter, Arial, sans-serif; background: #0F172A; margin: 0; padding: 40px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #1E293B; border-radius: 16px; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #6366F1; font-size: 28px; margin: 0;">AI Interview Platform</h1>
                    </div>
                    <h2 style="color: #F1F5F9; font-size: 22px;">Reset your password</h2>
                    <p style="color: #94A3B8; font-size: 16px; line-height: 1.6;">
                      Hi %s,<br><br>
                      We received a request to reset your password. Click the button below to choose a new password.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="%s" style="background: #F43F5E; color: white; padding: 14px 32px; border-radius: 8px;
                         text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                        Reset Password
                      </a>
                    </div>
                    <p style="color: #64748B; font-size: 14px;">
                      This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    <hr style="border: 1px solid #334155; margin: 32px 0;">
                    <p style="color: #64748B; font-size: 12px; text-align: center;">
                      If the button doesn't work, copy and paste this link: <a href="%s" style="color: #6366F1;">%s</a>
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(firstName, resetLink, resetLink, resetLink);
    }

    private String buildWelcomeEmailHtml(String firstName) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Inter, Arial, sans-serif; background: #0F172A; margin: 0; padding: 40px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #1E293B; border-radius: 16px; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #6366F1; font-size: 28px; margin: 0;">AI Interview Platform</h1>
                    </div>
                    <h2 style="color: #F1F5F9; font-size: 22px;">Welcome aboard, %s! 🎉</h2>
                    <p style="color: #94A3B8; font-size: 16px; line-height: 1.6;">
                      Your email has been verified and your account is ready. Here's what you can do next:
                    </p>
                    <ul style="color: #94A3B8; font-size: 15px; line-height: 2;">
                      <li>📄 Upload your resume for AI analysis</li>
                      <li>🎙️ Start a mock interview with AI feedback</li>
                      <li>💻 Practice coding challenges</li>
                      <li>📊 Track your progress on the dashboard</li>
                    </ul>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="#" style="background: #6366F1; color: white; padding: 14px 32px; border-radius: 8px;
                         text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(firstName);
    }
}
