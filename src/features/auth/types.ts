import type { CurrencyCode } from '@/types/finance';

export type AccountTypeCategory = 'LOCAL_DEMO' | 'VERIFIED';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  location?: string | null;
  monthlySavingsTarget?: number;
  isEmailVerified: boolean;
  accountType: AccountTypeCategory;
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

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
  isEmailVerified: boolean;
  user: Partial<User>;
  verificationPreview?: {
    code: string;
    token: string;
    expiresAt: string;
  };
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

export interface VerifyEmailData {
  email?: string;
  code?: string;
  token?: string;
}

export interface ResendVerificationData {
  email: string;
}
