import { z } from 'zod';
import type { CurrencyCode } from '@/types/finance';

export type ThemeMode = 'light' | 'dark' | 'system';
export type NumberFormatSystem = 'SOUTH_ASIAN' | 'INTERNATIONAL';

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  monthlySavingsTarget: number;
}

export interface AppPreferences {
  currency: CurrencyCode;
  numberFormat: NumberFormatSystem;
  hideDecimals: boolean;
  theme: ThemeMode;
  monthStartDay: number;
}

export interface SettingsState {
  profile: UserProfile;
  preferences: AppPreferences;
}

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  location: z.string().trim().min(2, 'Location is required').max(80, 'Location cannot exceed 80 characters'),
  monthlySavingsTarget: z.number().min(0, 'Savings target must be at least 0'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const preferencesSchema = z.object({
  currency: z.enum(['BDT', 'USD', 'EUR', 'GBP']),
  numberFormat: z.enum(['SOUTH_ASIAN', 'INTERNATIONAL']),
  hideDecimals: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
  monthStartDay: z.number().min(1, 'Day must be between 1 and 28').max(28, 'Day must be between 1 and 28'),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
