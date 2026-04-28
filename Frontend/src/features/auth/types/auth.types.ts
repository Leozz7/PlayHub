export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  provider?: 'google' | 'apple' | 'email';
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
