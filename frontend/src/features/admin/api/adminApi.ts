import api from '@lib/axios';
import type { ApiResponse } from '@/types/auth.types';

export interface UserAdminResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const BASE = '/api/v1/admin/users';

export const adminApi = {
  getUsers: (page = 0, size = 10, sort = 'createdAt', direction = 'desc') =>
    api.get<ApiResponse<PagedResponse<UserAdminResponse>>>(BASE, {
      params: { page, size, sort, direction },
    }),

  suspendUser: (id: string) =>
    api.put<ApiResponse<void>>(`${BASE}/${id}/suspend`),

  activateUser: (id: string) =>
    api.put<ApiResponse<void>>(`${BASE}/${id}/activate`),
};
