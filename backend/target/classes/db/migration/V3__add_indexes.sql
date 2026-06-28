-- ============================================================
-- V3: Performance Indexes
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_users_role_active     ON users(role, active);
CREATE INDEX idx_users_created_at      ON users(created_at DESC);

-- ─── Refresh Tokens ──────────────────────────────────────────
CREATE INDEX idx_refresh_tokens_user        ON refresh_tokens(user_id, revoked);
CREATE INDEX idx_refresh_tokens_token       ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at  ON refresh_tokens(expires_at) WHERE revoked = FALSE;

-- ─── Email Verifications ─────────────────────────────────────
CREATE INDEX idx_email_verif_token     ON email_verifications(token);
CREATE INDEX idx_email_verif_user      ON email_verifications(user_id, used);

-- ─── Password Resets ─────────────────────────────────────────
CREATE INDEX idx_pwd_reset_token       ON password_resets(token);
CREATE INDEX idx_pwd_reset_user        ON password_resets(user_id, used);

-- ─── Resumes ─────────────────────────────────────────────────
CREATE INDEX idx_resumes_user_active   ON resumes(user_id, active);

-- ─── Interviews ──────────────────────────────────────────────
CREATE INDEX idx_interviews_user_status     ON interviews(user_id, status);
CREATE INDEX idx_interviews_user_created    ON interviews(user_id, created_at DESC);
CREATE INDEX idx_interviews_type_difficulty ON interviews(type, difficulty);

-- ─── Interview Questions ──────────────────────────────────────
CREATE INDEX idx_interview_questions_interview ON interview_questions(interview_id, sequence_no);

-- ─── Coding Submissions ──────────────────────────────────────
CREATE INDEX idx_coding_submissions_user       ON coding_submissions(user_id, submitted_at DESC);
CREATE INDEX idx_coding_submissions_challenge  ON coding_submissions(challenge_id, status);
CREATE INDEX idx_coding_submissions_user_chal  ON coding_submissions(user_id, challenge_id);

-- ─── Coding Challenges ───────────────────────────────────────
CREATE INDEX idx_coding_challenges_difficulty  ON coding_challenges(difficulty, active);
CREATE INDEX idx_coding_challenges_language    ON coding_challenges(language, active);

-- ─── Notifications ───────────────────────────────────────────
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_user_date   ON notifications(user_id, created_at DESC);

-- ─── User Analytics ──────────────────────────────────────────
CREATE INDEX idx_user_analytics_user_date  ON user_analytics(user_id, record_date DESC);

-- ─── JSONB GIN Indexes (for querying inside JSON fields) ─────
CREATE INDEX idx_user_profiles_skills_gin  ON user_profiles USING gin(skills);
CREATE INDEX idx_resumes_ai_analysis_gin   ON resumes USING gin(ai_analysis);
CREATE INDEX idx_interviews_ai_summary_gin ON interviews USING gin(ai_summary);
