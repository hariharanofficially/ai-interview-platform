import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '@lib/utils';
import type { RegisterFormData } from '@/types/auth.types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authApi.register({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        password:  data.password,
      }),
    onSuccess: (_, variables) => {
      toast.success('Account created! Please check your email to verify your account.');
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}&pending=true`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
