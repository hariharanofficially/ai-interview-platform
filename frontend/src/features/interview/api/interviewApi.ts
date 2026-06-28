import api from '@lib/axios';
import type { ApiResponse } from '@/types/auth.types';

export interface InterviewSetupRequest {
  targetRole: string;
  difficulty: string;
  questionCount: number;
}

export interface InterviewQuestionResponse {
  id: string;
  questionText: string;
  orderIndex: number;
  expectedKeyPoints: string[];
  aiFeedback?: string;
  score?: number;
  userAnswerTranscript?: string;
}

export interface InterviewSessionResponse {
  id: string;
  targetRole: string;
  difficulty: string;
  status: string;
  overallScore: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  questions: InterviewQuestionResponse[];
}

const BASE = '/api/v1/interviews';

export const interviewApi = {
  setupInterview: (data: InterviewSetupRequest) =>
    api.post<ApiResponse<InterviewSessionResponse>>(`${BASE}/setup`, data),

  getMyInterviews: () => 
    api.get<ApiResponse<InterviewSessionResponse[]>>(BASE),

  getInterviewSession: (id: string) =>
    api.get<ApiResponse<InterviewSessionResponse>>(`${BASE}/${id}`),

  getAudioUploadUrl: (contentType: string) =>
    api.post<ApiResponse<any>>(`${BASE}/upload-url`, null, { params: { contentType } }),

  submitAnswer: (sessionId: string, questionId: string, audioFileKey: string, contentType: string) =>
    api.post<ApiResponse<InterviewQuestionResponse>>(`${BASE}/${sessionId}/questions/${questionId}/answer`, {
      audioFileKey,
      contentType,
    }),
};
