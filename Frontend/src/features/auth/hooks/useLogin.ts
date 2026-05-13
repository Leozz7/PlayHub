import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { LoginCredentials, AuthResponse } from '../types/auth.types';
import { useAuthStore } from '@/data/useAuthStore';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });
}
