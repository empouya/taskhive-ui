import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from './auth.types';
import { apiClient } from '../../lib/apiClient';
import type { ApiAuthResponseDto, ApiUserDto } from '../../lib/contracts';
import { getErrorMessage } from '../../lib/apiError';
import { normalizeAuthResponse, normalizeUser } from '../../lib/normalizers';

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
      const { data } = await apiClient.post<ApiAuthResponseDto>('/auth/login/', credentials);
      return normalizeAuthResponse(data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed.'));
    }
  },

  me: async (accessToken?: string): Promise<User> => {
    try {
      const { data } = await apiClient.get<ApiUserDto>('/auth/me/', {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      return normalizeUser(data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load current user.'));
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
  },
};