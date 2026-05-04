export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  provider?: 'google' | 'apple' | 'email';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
