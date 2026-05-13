export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  cpf?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  provider?: 'google' | 'apple' | 'email';
}

export interface AuthResponse {
  user: User;
}
