/**
 * Authentication-related TypeScript types.
 * Mirrors the backend DTOs.
 */

export interface User {
  id:            string;
  email:         string;
  firstName:     string;
  lastName:      string;
  fullName:      string;
  role:          'CANDIDATE' | 'ADMIN';
  emailVerified: boolean;
  photoUrl:      string | null;
  createdAt:     string;
}

export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  expiresIn:    number;
  user:         User;
}

export interface ApiResponse<T> {
  success:   boolean;
  message?:  string;
  data?:     T;
  error?:    string;
  timestamp: string;
}

export interface RegisterFormData {
  firstName:  string;
  lastName:   string;
  email:      string;
  password:   string;
  confirmPassword: string;
}

export interface LoginFormData {
  email:    string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  newPassword:     string;
  confirmPassword: string;
}
