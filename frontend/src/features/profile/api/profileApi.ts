import api from '@lib/axios';
import type { ApiResponse } from '@/types/auth.types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  photoUrl: string | null;
  yearsExperience: number | null;
  currentRole: string | null;
  targetRole: string | null;
  skills: string[];
}

export type ProfileUpdateRequest = Partial<Omit<UserProfile, 'id' | 'email' | 'fullName' | 'photoUrl'>>;

export interface PresignedUrlResponse {
  url: string;
  key: string;
  method: string;
  expiresInSeconds: number;
}

const BASE = '/api/v1/users';

export const profileApi = {
  getProfile: () => api.get<ApiResponse<UserProfile>>(`${BASE}/me`),

  updateProfile: (data: ProfileUpdateRequest) =>
    api.put<ApiResponse<UserProfile>>(`${BASE}/me`, data),

  getUploadUrl: (contentType: string) =>
    api.post<ApiResponse<PresignedUrlResponse>>(`${BASE}/me/photo/upload-url`, null, {
      params: { contentType },
    }),

  uploadToS3: (url: string, file: File) =>
    // Uses raw axios or fetch to avoid interceptors (which attach JWTs to S3 URLs)
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    }),

  confirmUpload: (key: string) =>
    api.post<ApiResponse<void>>(`${BASE}/me/photo/confirm`, { key }),

  changePassword: (data: any) =>
    api.put<ApiResponse<void>>(`${BASE}/me/password`, data),
};
