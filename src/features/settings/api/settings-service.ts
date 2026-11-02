import type {
  UserProfile,
  AppPreferences,
  SettingsState,
} from '../schemas/settings-schema';
import {
  MOCK_ACCOUNTS,
  MOCK_CATEGORIES,
  MOCK_TRANSACTIONS,
} from '@/mocks/finance-data';
import { INITIAL_MOCK_BUDGETS } from '@/features/budgets/api/budgets-service';

const SETTINGS_STORAGE_KEY = 'money_manager_settings_v1';
const ACCOUNTS_STORAGE_KEY = 'money_manager_accounts_v1';
const CATEGORIES_STORAGE_KEY = 'money_manager_categories_v1';
const TRANSACTIONS_STORAGE_KEY = 'money_manager_transactions_v1';
const BUDGETS_STORAGE_KEY = 'money_manager_budgets_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Akash Das',
  email: 'akash@example.com',
  location: 'Dhaka, Bangladesh',
  monthlySavingsTarget: 25000,
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  currency: 'BDT',
  numberFormat: 'SOUTH_ASIAN',
  hideDecimals: false,
  theme: 'system',
  monthStartDay: 1,
};

export interface ExportDataBundle {
  version: string;
  appName: string;
  exportedAt: string;
  settings: SettingsState;
  accounts: unknown[];
  categories: unknown[];
  transactions: unknown[];
  budgets: unknown[];
}

export const settingsService = {
  /**
   * Fetch current user settings & preferences
   */
  async getSettings(): Promise<SettingsState> {
    if (typeof window === 'undefined') {
      return {
        profile: DEFAULT_USER_PROFILE,
        preferences: DEFAULT_PREFERENCES,
      };
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        const initial: SettingsState = {
          profile: DEFAULT_USER_PROFILE,
          preferences: DEFAULT_PREFERENCES,
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(stored);
      return {
        profile: { ...DEFAULT_USER_PROFILE, ...(parsed.profile || {}) },
        preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences || {}) },
      };
    } catch {
      return {
        profile: DEFAULT_USER_PROFILE,
        preferences: DEFAULT_PREFERENCES,
      };
    }
  },

  /**
   * Save complete settings state
   */
  async saveSettings(settings: SettingsState): Promise<SettingsState> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
    return settings;
  },

  /**
   * Update profile information
   */
  async updateProfile(profile: UserProfile): Promise<SettingsState> {
    const current = await this.getSettings();
    const updated: SettingsState = {
      ...current,
      profile,
    };
    return this.saveSettings(updated);
  },

  /**
   * Update app preferences (currency, number format, theme)
   */
  async updatePreferences(preferences: AppPreferences): Promise<SettingsState> {
    const current = await this.getSettings();
    const updated: SettingsState = {
      ...current,
      preferences,
    };
    return this.saveSettings(updated);
  },

  /**
   * Export all Money Manager data as a single JSON bundle
   */
  async exportAllData(): Promise<ExportDataBundle> {
    const settings = await this.getSettings();

    let accounts: unknown[] = [];
    let categories: unknown[] = [];
    let transactions: unknown[] = [];
    let budgets: unknown[] = [];

    if (typeof window !== 'undefined') {
      try {
        accounts = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]');
      } catch {}
      try {
        categories = JSON.parse(localStorage.getItem(CATEGORIES_STORAGE_KEY) || '[]');
      } catch {}
      try {
        transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]');
      } catch {}
      try {
        budgets = JSON.parse(localStorage.getItem(BUDGETS_STORAGE_KEY) || '[]');
      } catch {}
    }

    return {
      version: '1.0.0',
      appName: 'Money Manager',
      exportedAt: new Date().toISOString(),
      settings,
      accounts: accounts.length > 0 ? accounts : MOCK_ACCOUNTS,
      categories: categories.length > 0 ? categories : MOCK_CATEGORIES,
      transactions: transactions.length > 0 ? transactions : MOCK_TRANSACTIONS,
      budgets: budgets.length > 0 ? budgets : INITIAL_MOCK_BUDGETS,
    };
  },

  /**
   * Import data from an exported JSON file string
   */
  async importAllData(jsonString: string): Promise<{
    success: boolean;
    accountsCount: number;
    transactionsCount: number;
    budgetsCount: number;
  }> {
    if (typeof window === 'undefined') {
      throw new Error('Import can only be executed in a browser environment');
    }

    try {
      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      let accountsCount = 0;
      let transactionsCount = 0;
      let budgetsCount = 0;

      // Settings restore
      if (data.settings) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
      }

      // Accounts restore
      if (Array.isArray(data.accounts)) {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(data.accounts));
        accountsCount = data.accounts.length;
      }

      // Categories restore
      if (Array.isArray(data.categories)) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data.categories));
      }

      // Transactions restore
      if (Array.isArray(data.transactions)) {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(data.transactions));
        transactionsCount = data.transactions.length;
      }

      // Budgets restore
      if (Array.isArray(data.budgets)) {
        localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(data.budgets));
        budgetsCount = data.budgets.length;
      }

      return {
        success: true,
        accountsCount,
        transactionsCount,
        budgetsCount,
      };
    } catch (err: unknown) {
      console.error('Import failed:', err);
      throw new Error('Failed to parse and import backup file. Ensure it is a valid Money Manager export.');
    }
  },

  /**
   * Factory Reset: clears all localStorage keys and re-populates with default initial mock data
   */
  async factoryReset(): Promise<void> {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    localStorage.removeItem(BUDGETS_STORAGE_KEY);

    // Re-seed clean demo state
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        profile: DEFAULT_USER_PROFILE,
        preferences: DEFAULT_PREFERENCES,
      })
    );
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(MOCK_ACCOUNTS));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(MOCK_TRANSACTIONS));
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_BUDGETS));
  },
};
