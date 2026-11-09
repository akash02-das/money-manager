import { apiClient, tokenStorage } from '@/lib/api-client';
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '../types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data, {
      skipAuth: true,
    });
    if (res?.accessToken) {
      tokenStorage.setAccessToken(res.accessToken);
      if (res.refreshToken) {
        tokenStorage.setRefreshToken(res.refreshToken);
      }
    }
    return res;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials, {
      skipAuth: true,
    });
    if (res?.accessToken) {
      tokenStorage.setAccessToken(res.accessToken);
      if (res.refreshToken) {
        tokenStorage.setRefreshToken(res.refreshToken);
      }
    }
    return res;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors during logout
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async getMe(): Promise<User | null> {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    try {
      return await apiClient.get<User>('/auth/me');
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  },
};

