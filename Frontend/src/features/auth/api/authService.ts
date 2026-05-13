import { api } from '@/lib/api';
import { AuthResponse, LoginCredentials } from '../types/auth.types';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<void>;
}

export const authService: IAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },
};
