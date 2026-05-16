import type { RegisterCredentials, AuthResponse, LoginCredentials } from './auth.types';
import { apiClient } from '../../lib/apiClient';
import { getErrorMessage } from '../../lib/apiError';


export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<void> => {
    try {
      await apiClient.post('/auth/register/', credentials);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Registration failed.'));
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed.'));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Logout failed.'));
    }
  },

  refresh: async (): Promise<string> => {
    try {
      const { data } = await apiClient.post<{ access: string }>('/auth/token/refresh/');
      return data.access;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Token refresh failed.'));
    }
  }
};
