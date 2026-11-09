'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  User,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
  AuthResponse,
  VerifyEmailData,
  ResendVerificationData,
  AccountTypeCategory,
} from '../types';
import { authService } from '../api/auth-service';
import { apiClient, tokenStorage } from '@/lib/api-client';
import {
  DEMO_SESSION_KEY,
  DEMO_STORAGE_KEYS,
  DEFAULT_APP_CATEGORIES,
} from '@/lib/storage-adapter';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  isVerified: boolean;
  accountType: AccountTypeCategory | null;
  isBackendConnected: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  verifyEmail: (data: VerifyEmailData) => Promise<AuthResponse>;
  resendVerification: (data: ResendVerificationData) => Promise<any>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const isOnline = await apiClient.isBackendAvailable();
      setIsBackendConnected(isOnline);

      // 1. If backend tokens exist, verify the cloud session
      if (authService.isAuthenticated()) {
        if (isOnline) {
          const profile = await authService.getMe();
          if (profile && profile.isEmailVerified) {
            profile.accountType = 'VERIFIED';
            setUser(profile);
            return;
          }
        }
      }

      // 2. Check for an active Local Demo session in LocalStorage
      if (typeof window !== 'undefined') {
        const storedDemo = localStorage.getItem(DEMO_SESSION_KEY);
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            parsed.accountType = 'LOCAL_DEMO';
            setUser(parsed);
            return;
          } catch {
            localStorage.removeItem(DEMO_SESSION_KEY);
          }
        }
      }

      setUser(null);
    } catch {
      setUser(null);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Verified Account Login:
   * Requires backend validation and verified email status.
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_SESSION_KEY);
      }
      const verifiedUser: User = {
        ...res.user,
        accountType: 'VERIFIED',
        isEmailVerified: true,
      };
      setUser(verifiedUser);
      setIsBackendConnected(true);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * User Registration:
   * Creates an unverified account. Does NOT issue tokens or log the user in
   * until email verification is completed.
   */
  const register = useCallback(async (data: RegisterData): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Email Verification:
   * Consumes verification code or link token and logs the user in as VERIFIED.
   */
  const verifyEmail = useCallback(async (data: VerifyEmailData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyEmail(data);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_SESSION_KEY);
      }
      const verifiedUser: User = {
        ...res.user,
        accountType: 'VERIFIED',
        isEmailVerified: true,
      };
      setUser(verifiedUser);
      setIsBackendConnected(true);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resend Verification Code
   */
  const resendVerification = useCallback(async (data: ResendVerificationData) => {
    return await authService.resendVerification(data);
  }, []);

  /**
   * Jump in with Instant Demo:
   * Directs user immediately to a clean dashboard with zero preloaded mock data.
   * Entirely isolated in LocalStorage with zero backend network requests.
   */
  const loginAsDemo = useCallback(() => {
    tokenStorage.clearTokens();

    const demoUser: User = {
      id: 'usr-demo-local',
      name: 'Demo Explorer',
      email: 'demo@browser.local',
      currency: 'BDT',
      location: 'Local Browser (Offline)',
      monthlySavingsTarget: 0,
      isEmailVerified: false,
      accountType: 'LOCAL_DEMO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));

      // Clean slate initialization: ZERO accounts, ZERO transactions, ZERO budgets
      if (!localStorage.getItem(DEMO_STORAGE_KEYS.ACCOUNTS)) {
        localStorage.setItem(DEMO_STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
      }
      if (!localStorage.getItem(DEMO_STORAGE_KEYS.TRANSACTIONS)) {
        localStorage.setItem(DEMO_STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      }
      if (!localStorage.getItem(DEMO_STORAGE_KEYS.BUDGETS)) {
        localStorage.setItem(DEMO_STORAGE_KEYS.BUDGETS, JSON.stringify([]));
      }
      if (!localStorage.getItem(DEMO_STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(DEMO_STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_APP_CATEGORIES));
      }

      window.dispatchEvent(new Event('money-manager-storage-sync'));
    }

    setUser(demoUser);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_SESSION_KEY);
      }
      if (authService.isAuthenticated()) {
        await authService.logout();
      }
      setUser(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('money-manager-storage-sync'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const profile = await authService.getMe();
      if (profile && profile.isEmailVerified) {
        profile.accountType = 'VERIFIED';
        setUser(profile);
      }
    } catch {
      // Ignore
    }
  }, []);

  const isDemo = user?.accountType === 'LOCAL_DEMO';
  const isVerified = user?.accountType === 'VERIFIED' && !!user?.isEmailVerified;

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isDemo,
      isVerified,
      accountType: user?.accountType || null,
      isBackendConnected,
      login,
      register,
      verifyEmail,
      resendVerification,
      loginAsDemo,
      logout,
      refreshProfile,
    }),
    [
      user,
      isLoading,
      isDemo,
      isVerified,
      isBackendConnected,
      login,
      register,
      verifyEmail,
      resendVerification,
      loginAsDemo,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
