import axios from 'axios';
import type { RegisterCredentials, AuthResponse, LoginCredentials } from './auth.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const authClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const { data } = await authClient.post('/auth/register/', credentials);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const { data } = await authClient.post<AuthResponse>('/auth/login/', credentials);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const { data } = await authClient.post('/auth/logout/');
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  refresh: async (): Promise<string> => {
    try {
      const { data } = await authClient.post('/auth/token/refresh/');
      return data.access;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};

const normalizeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Return the specific server error detail if available
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return new Error(message);
  }
  return error;
};