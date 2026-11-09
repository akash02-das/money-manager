import type { CurrencyCode } from '@/types/finance';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  location?: string | null;
  monthlySavingsTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  currency?: CurrencyCode;
  location?: string;
}

