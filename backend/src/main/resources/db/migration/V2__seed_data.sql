-- ============================================================
-- V2: Seed Data
-- Default admin user + Prompt Templates
-- ============================================================

-- ─── Default Admin User ──────────────────────────────────────
-- Password: Admin@1234 (BCrypt hash, cost=12)
-- IMPORTANT: Change this password immediately in production.
INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified, active)
VALUES (
    gen_random_uuid(),
    'admin@aiinterview.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewNfFMfyXh8j2xam',
    'Platform',
    'Admin',
    'ADMIN',
    TRUE,
    TRUE
);

-- ─── Prompt Templates ────────────────────────────────────────
INSERT INTO prompt_templates (key, description, template, version) VALUES

('QUESTION_GENERATION_HR',
 'Generate HR interview questions',
 'You are a senior HR interviewer. Generate {count} HR interview questions for a {jobRole} position.
Return a JSON array of objects with fields: "question" (string) and "category" (string, always "HR").
Difficulty: {difficulty}. Focus on cultural fit, communication, motivation, and soft skills.
Output ONLY valid JSON array, no markdown.', 1),

('QUESTION_GENERATION_TECHNICAL',
 'Generate technical interview questions',
 'You are a senior technical interviewer at a top tech company. Generate {count} technical interview questions for a {jobRole} position.
Return a JSON array of objects with fields: "question" (string) and "category" (string, always "TECHNICAL").
Difficulty: {difficulty}. Focus on algorithms, data structures, system concepts, and {jobRole}-specific technologies.
Output ONLY valid JSON array, no markdown.', 1),

('QUESTION_GENERATION_BEHAVIOURAL',
 'Generate behavioural interview questions',
 'You are an expert behavioural interviewer. Generate {count} STAR-method behavioural interview questions for a {jobRole} position.
Return a JSON array of objects with fields: "question" (string) and "category" (string, always "BEHAVIOURAL").
Difficulty: {difficulty}. Focus on leadership, teamwork, conflict resolution, and past experiences.
Output ONLY valid JSON array, no markdown.', 1),

('QUESTION_GENERATION_SYSTEM_DESIGN',
 'Generate system design interview questions',
 'You are a principal engineer. Generate {count} system design interview questions for a {jobRole} position.
Return a JSON array of objects with fields: "question" (string) and "category" (string, always "SYSTEM_DESIGN").
Difficulty: {difficulty}. Include scalability, reliability, and trade-off considerations.
Output ONLY valid JSON array, no markdown.', 1),

('ANSWER_FEEDBACK',
 'Generate AI feedback for a candidate answer',
 'You are an expert interviewer providing feedback on an interview answer.

Interview Type: {interviewType}
Job Role: {jobRole}
Question: {question}
Candidate Answer: {answer}

Provide detailed, constructive feedback in JSON format with these fields:
- "score": integer 0-100
- "strengths": array of strength points (strings)
- "improvements": array of improvement suggestions (strings)
- "idealAnswer": brief ideal answer outline (string)
- "overallFeedback": overall summary (string)

Output ONLY valid JSON, no markdown.', 1),

('INTERVIEW_SUMMARY',
 'Generate overall interview summary',
 'You are an expert interview coach. Summarize this completed interview.

Job Role: {jobRole}
Interview Type: {interviewType}
Questions and Scores: {questionsAndScores}

Generate a comprehensive summary in JSON format with:
- "overallScore": integer 0-100
- "strengths": top 3 strengths observed (array of strings)
- "areasToImprove": top 3 areas needing improvement (array of strings)
- "recommendedResources": 3 learning resources with "title" and "topic" (array of objects)
- "readinessLevel": one of "NOT_READY", "NEEDS_PRACTICE", "ALMOST_READY", "READY"
- "summary": 2-3 sentence executive summary (string)

Output ONLY valid JSON, no markdown.', 1),

('RESUME_ANALYSIS',
 'Analyze resume and provide AI insights',
 'You are an expert career counselor and ATS specialist. Analyze the following resume for a {jobRole} position.

Resume Text:
{resumeText}

Provide a comprehensive analysis in JSON format with:
- "atsScore": integer 0-100
- "strengths": array of resume strengths (strings)
- "weaknesses": array of resume weaknesses (strings)
- "keywordsMissing": important missing keywords for {jobRole} (array of strings)
- "suggestions": specific improvement suggestions (array of strings)
- "formatFeedback": feedback on resume format and structure (string)
- "summary": 2-3 sentence overall assessment (string)

Output ONLY valid JSON, no markdown.', 1);
