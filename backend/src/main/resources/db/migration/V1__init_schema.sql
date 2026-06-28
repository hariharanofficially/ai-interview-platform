-- ============================================================
-- V1: Initial Schema
-- AI Interview Platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'CANDIDATE'
                        CHECK (role IN ('CANDIDATE', 'ADMIN')),
    email_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

-- ─── USER PROFILES ───────────────────────────────────────────
CREATE TABLE user_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone           VARCHAR(20),
    location        VARCHAR(200),
    bio             TEXT,
    linkedin_url    VARCHAR(500),
    github_url      VARCHAR(500),
    portfolio_url   VARCHAR(500),
    photo_url       VARCHAR(1000),
    photo_key       VARCHAR(500),   -- S3/MinIO object key
    skills          JSONB       NOT NULL DEFAULT '[]'::jsonb,
    years_experience INTEGER    CHECK (years_experience >= 0 AND years_experience <= 50),
    current_role    VARCHAR(200),
    target_role     VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REFRESH TOKENS ──────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
    user_agent  VARCHAR(500),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMAIL VERIFICATIONS ─────────────────────────────────────
CREATE TABLE email_verifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PASSWORD RESETS ─────────────────────────────────────────
CREATE TABLE password_resets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RESUMES ─────────────────────────────────────────────────
CREATE TABLE resumes (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url            VARCHAR(1000) NOT NULL,
    file_key            VARCHAR(500) NOT NULL,      -- S3/MinIO object key
    original_filename   VARCHAR(255) NOT NULL,
    content_type        VARCHAR(100) NOT NULL,
    file_size_bytes     BIGINT      NOT NULL,
    parsed_text         TEXT,
    ats_score           SMALLINT    CHECK (ats_score >= 0 AND ats_score <= 100),
    ai_analysis         JSONB,
    active              BOOLEAN     NOT NULL DEFAULT TRUE,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INTERVIEWS ──────────────────────────────────────────────
CREATE TABLE interviews (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30)  NOT NULL
                        CHECK (type IN ('HR', 'TECHNICAL', 'BEHAVIOURAL', 'SYSTEM_DESIGN', 'MIXED')),
    job_role        VARCHAR(200),
    difficulty      VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM'
                        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    overall_score   SMALLINT    CHECK (overall_score >= 0 AND overall_score <= 100),
    ai_summary      JSONB,
    duration_seconds INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);

-- ─── INTERVIEW QUESTIONS ─────────────────────────────────────
CREATE TABLE interview_questions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id    UUID        NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    category        VARCHAR(30)  NOT NULL
                        CHECK (category IN ('HR', 'TECHNICAL', 'BEHAVIOURAL', 'SYSTEM_DESIGN', 'CODING')),
    question_text   TEXT        NOT NULL,
    ai_feedback     TEXT,
    score           SMALLINT    CHECK (score >= 0 AND score <= 100),
    sequence_no     SMALLINT    NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INTERVIEW ANSWERS ───────────────────────────────────────
CREATE TABLE interview_answers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     UUID        NOT NULL UNIQUE REFERENCES interview_questions(id) ON DELETE CASCADE,
    answer_text     TEXT        NOT NULL,
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CODING CHALLENGES ───────────────────────────────────────
CREATE TABLE coding_challenges (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    description         TEXT        NOT NULL,
    difficulty          VARCHAR(10)  NOT NULL
                            CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    language            VARCHAR(20)  NOT NULL
                            CHECK (language IN ('JAVA', 'JAVASCRIPT', 'PYTHON', 'SQL')),
    starter_code        TEXT,
    solution_code       TEXT,
    time_limit_ms       INTEGER     NOT NULL DEFAULT 2000
                            CHECK (time_limit_ms > 0),
    memory_limit_mb     INTEGER     NOT NULL DEFAULT 256
                            CHECK (memory_limit_mb > 0),
    active              BOOLEAN     NOT NULL DEFAULT TRUE,
    tags                JSONB       NOT NULL DEFAULT '[]'::jsonb,
    created_by          UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TEST CASES ───────────────────────────────────────────────
CREATE TABLE test_cases (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    UUID        NOT NULL REFERENCES coding_challenges(id) ON DELETE CASCADE,
    input           TEXT        NOT NULL,
    expected_output TEXT        NOT NULL,
    is_hidden       BOOLEAN     NOT NULL DEFAULT FALSE,
    explanation     TEXT,
    sequence_no     SMALLINT    NOT NULL DEFAULT 0
);

-- ─── CODING SUBMISSIONS ──────────────────────────────────────
CREATE TABLE coding_submissions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    UUID        NOT NULL REFERENCES coding_challenges(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_code  TEXT        NOT NULL,
    language        VARCHAR(20)  NOT NULL,
    status          VARCHAR(20)  NOT NULL
                        CHECK (status IN ('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER',
                                          'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED',
                                          'RUNTIME_ERROR', 'COMPILATION_ERROR')),
    score           SMALLINT    CHECK (score >= 0 AND score <= 100),
    time_taken_ms   INTEGER,
    memory_used_mb  INTEGER,
    test_results    JSONB,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT        NOT NULL,
    data        JSONB,
    read        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROMPT TEMPLATES ────────────────────────────────────────
CREATE TABLE prompt_templates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    template    TEXT        NOT NULL,
    version     INTEGER     NOT NULL DEFAULT 1,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USER ANALYTICS ──────────────────────────────────────────
CREATE TABLE user_analytics (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date         DATE        NOT NULL,
    interviews_count    INTEGER     NOT NULL DEFAULT 0,
    coding_count        INTEGER     NOT NULL DEFAULT 0,
    streak_days         INTEGER     NOT NULL DEFAULT 0,
    skill_scores        JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, record_date)
);

-- ─── UPDATED_AT trigger function ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coding_challenges_updated_at
    BEFORE UPDATE ON coding_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
