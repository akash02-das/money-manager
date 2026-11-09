'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../api/auth-service';
import { apiClient } from '@/lib/api-client';

const DEMO_USER_KEY = 'money_manager_demo_session_v1';

export const DEFAULT_DEMO_USER: User = {
  id: 'usr-demo-local',
  name: 'Akash Das',
  email: 'demo@moneymanager.local',
  currency: 'BDT',
  location: 'Dhaka, Bangladesh',
  monthlySavingsTarget: 25000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBackendConnected: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginAsDemo: () => Promise<void>;
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

      if (isOnline && authService.isAuthenticated()) {
        const profile = await authService.getMe();
        if (profile) {
          setUser(profile);
          return;
        }
      }

      // Check for persisted local demo session
      if (typeof window !== 'undefined') {
        const storedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (storedDemo) {
          try {
            setUser(JSON.parse(storedDemo));
            return;
          } catch {
            localStorage.removeItem(DEMO_USER_KEY);
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

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_USER_KEY);
      }
      setUser(res.user);
      setIsBackendConnected(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_USER_KEY);
      }
      setUser(res.user);
      setIsBackendConnected(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async () => {
    setIsLoading(true);
    try {
      const isOnline = await apiClient.isBackendAvailable();
      setIsBackendConnected(isOnline);

      if (isOnline) {
        try {
          const res = await authService.login({
            email: 'demo@moneymanager.local',
            password: 'DemoPassword123!',
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DEMO_USER_KEY);
          }
          setUser(res.user);
          return;
        } catch {
          try {
            const res = await authService.register({
              name: 'Akash Das',
              email: 'demo@moneymanager.local',
              password: 'DemoPassword123!',
              currency: 'BDT',
              location: 'Dhaka, Bangladesh',
            });
            if (typeof window !== 'undefined') {
              localStorage.removeItem(DEMO_USER_KEY);
            }
            setUser(res.user);
            return;
          } catch {
            // Fall through to local demo if backend database rejected creation
          }
        }
      }

      // Offline/Local Demo Session: instantaneous zero-dependency access
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
      }
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_USER_KEY);
      }
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const profile = await authService.getMe();
      if (profile) setUser(profile);
    } catch {
      // Ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isBackendConnected,
      login,
      register,
      loginAsDemo,
      logout,
      refreshProfile,
    }),
    [user, isLoading, isBackendConnected, login, register, loginAsDemo, logout, refreshProfile],
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
