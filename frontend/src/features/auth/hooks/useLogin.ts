import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@lib/utils';
import type { LoginFormData } from '@/types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data.data!;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
