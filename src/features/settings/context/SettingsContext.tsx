'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  UserProfile,
  AppPreferences,
  ThemeMode,
} from '../schemas/settings-schema';
import {
  settingsService,
  DEFAULT_USER_PROFILE,
  DEFAULT_PREFERENCES,
} from '../api/settings-service';
import type { CurrencyCode } from '@/types/finance';

interface SettingsContextValue {
  profile: UserProfile;
  preferences: AppPreferences;
  activeCurrency: CurrencyCode;
  isLoading: boolean;
  isSaving: boolean;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updatePreferences: (preferences: AppPreferences) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (jsonFile: File) => Promise<{ success: boolean; message: string }>;
  factoryReset: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Apply theme to document.documentElement
  const applyTheme = useCallback((theme: ThemeMode) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const data = await settingsService.getSettings();
        setProfile(data.profile);
        setPreferences(data.preferences);
        applyTheme(data.preferences.theme);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [applyTheme]);

  // Listen for system appearance change if theme is 'system'
  useEffect(() => {
    if (preferences.theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme, applyTheme]);

  const updateProfile = async (newProfile: UserProfile): Promise<void> => {
    try {
      setIsSaving(true);
      const updated = await settingsService.updateProfile(newProfile);
      setProfile(updated.profile);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreferences = async (newPreferences: AppPreferences): Promise<void> => {
    try {
      setIsSaving(true);
      const updated = await settingsService.updatePreferences(newPreferences);
      setPreferences(updated.preferences);
      applyTheme(updated.preferences.theme);
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async (): Promise<void> => {
    const bundle = await settingsService.exportAllData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(bundle, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `money-manager-backup-${dateStamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = async (
    jsonFile: File
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const result = await settingsService.importAllData(content);
          // Reload settings state
          const refreshed = await settingsService.getSettings();
          setProfile(refreshed.profile);
          setPreferences(refreshed.preferences);
          applyTheme(refreshed.preferences.theme);

          resolve({
            success: true,
            message: `Restored ${result.accountsCount} accounts, ${result.transactionsCount} transactions, and ${result.budgetsCount} budgets.`,
          });
        } catch (err: unknown) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(jsonFile);
    });
  };

  const factoryReset = async (): Promise<void> => {
    await settingsService.factoryReset();
    setProfile(DEFAULT_USER_PROFILE);
    setPreferences(DEFAULT_PREFERENCES);
    applyTheme(DEFAULT_PREFERENCES.theme);
    // Reload page to refresh all context states cleanly
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const value: SettingsContextValue = {
    profile,
    preferences,
    activeCurrency: preferences.currency,
    isLoading,
    isSaving,
    updateProfile,
    updatePreferences,
    exportData,
    importData,
    factoryReset,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
