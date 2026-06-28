import api from '@lib/axios';
import type { ApiResponse } from '@/types/auth.types';

export interface PresignedUrlResponse {
  url: string;
  key: string;
  method: string;
  expiresInSeconds: number;
}

export interface ResumeUploadConfirmRequest {
  fileKey: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
}

export interface ResumeResponse {
  id: string;
  fileKey: string;
  originalFilename: string;
  downloadUrl: string;
  extractedData: any;
  aiFeedback: any;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/v1/resumes';

export const resumeApi = {
  getUploadUrl: (contentType: string) =>
    api.post<ApiResponse<PresignedUrlResponse>>(`${BASE}/upload-url`, null, {
      params: { contentType },
    }),

  uploadToS3: (url: string, file: File) =>
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    }),

  processResume: (data: ResumeUploadConfirmRequest) =>
    api.post<ApiResponse<ResumeResponse>>(`${BASE}/process`, data),

  getMyResume: () => api.get<ApiResponse<ResumeResponse>>(`${BASE}/me`),
};
