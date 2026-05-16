export interface User {
  id: number;
  email: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  access: string;
  user: User;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}