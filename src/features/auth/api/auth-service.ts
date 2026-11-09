import { apiClient, tokenStorage } from '@/lib/api-client';
import type {
  User,
  AuthResponse,
  RegisterResponse,
  LoginCredentials,
  RegisterData,
  VerifyEmailData,
  ResendVerificationData,
} from '../types';

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    return await apiClient.post<RegisterResponse>('/auth/register', data, {
      skipAuth: true,
    });
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
    if (res?.user) {
      res.user.accountType = 'VERIFIED';
    }
    return res;
  },

  async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/verify-email', data, {
      skipAuth: true,
    });
    if (res?.accessToken) {
      tokenStorage.setAccessToken(res.accessToken);
      if (res.refreshToken) {
        tokenStorage.setRefreshToken(res.refreshToken);
      }
    }
    if (res?.user) {
      res.user.accountType = 'VERIFIED';
    }
    return res;
  },

  async resendVerification(data: ResendVerificationData): Promise<any> {
    return await apiClient.post('/auth/resend-verification', data, {
      skipAuth: true,
    });
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
      const user = await apiClient.get<User>('/auth/me');
      if (user) {
        user.accountType = 'VERIFIED';
      }
      return user;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  },
};
