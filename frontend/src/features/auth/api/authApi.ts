import api from '@lib/axios';
import type { LoginFormData, LoginResponse, RegisterFormData, ApiResponse } from '@/types/auth.types';

const BASE = '/api/v1/auth';

export const authApi = {
  register: (data: Omit<RegisterFormData, 'confirmPassword'>) =>
    api.post<ApiResponse<void>>(`${BASE}/register`, data),

  login: (data: LoginFormData) =>
    api.post<ApiResponse<LoginResponse>>(`${BASE}/login`, data),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<void>>(`${BASE}/logout`, { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<LoginResponse>>(`${BASE}/refresh`, { refreshToken }),

  verifyEmail: (token: string) =>
    api.post<ApiResponse<void>>(`${BASE}/verify-email`, null, { params: { token } }),

  resendVerification: (email: string) =>
    api.post<ApiResponse<void>>(`${BASE}/resend-verification`, null, { params: { email } }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>(`${BASE}/forgot-password`, { email }),

  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    api.post<ApiResponse<void>>(`${BASE}/reset-password`, { token, newPassword, confirmPassword }),
};
