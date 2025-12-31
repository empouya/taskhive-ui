export interface User {
  id: string;
  email: string;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  password_confirm?: string;
}

export interface RegisterResponse {
  user: User
}

export interface AuthError {
  message: string;
  field?: string;
}