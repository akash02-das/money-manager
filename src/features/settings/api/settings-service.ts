import type {
  UserProfile,
  AppPreferences,
  SettingsState,
} from '../schemas/settings-schema';
import {
  parseAndValidateBackupJSON,
} from '../schemas/backup-schema';
import {
  getEntityStorageKey,
  DEFAULT_APP_CATEGORIES,
} from '@/lib/storage-adapter';

export const MONEY_MANAGER_STORAGE_SYNC_EVENT = 'money_manager_storage_sync';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Demo User',
  email: 'demo@browser.local',
  location: 'Local Browser',
  monthlySavingsTarget: 0,
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

function getSettingsKey(): string {
  return getEntityStorageKey('SETTINGS');
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
      const stored = localStorage.getItem(getSettingsKey());
      if (!stored) {
        const initial: SettingsState = {
          profile: DEFAULT_USER_PROFILE,
          preferences: DEFAULT_PREFERENCES,
        };
        localStorage.setItem(getSettingsKey(), JSON.stringify(initial));
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
      localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
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
        accounts = JSON.parse(localStorage.getItem(getEntityStorageKey('ACCOUNTS')) || '[]');
      } catch {}
      try {
        categories = JSON.parse(localStorage.getItem(getEntityStorageKey('CATEGORIES')) || '[]');
      } catch {}
      try {
        transactions = JSON.parse(localStorage.getItem(getEntityStorageKey('TRANSACTIONS')) || '[]');
      } catch {}
      try {
        budgets = JSON.parse(localStorage.getItem(getEntityStorageKey('BUDGETS')) || '[]');
      } catch {}
    }

    return {
      version: '1.0.0',
      appName: 'Money Manager',
      exportedAt: new Date().toISOString(),
      settings,
      accounts,
      categories: categories.length > 0 ? categories : DEFAULT_APP_CATEGORIES,
      transactions,
      budgets,
    };
  },

  /**
   * Import data from an exported JSON file string after rigorous schema validation
   */
  async importAllData(jsonString: string): Promise<{
    success: boolean;
    accountsCount: number;
    categoriesCount: number;
    transactionsCount: number;
    budgetsCount: number;
  }> {
    if (typeof window === 'undefined') {
      throw new Error('Import can only be executed in a browser environment');
    }

    try {
      // Rigorous validation using Zod schema
      const data = parseAndValidateBackupJSON(jsonString);

      // 1. Settings restore (if provided)
      if (data.settings) {
        localStorage.setItem(getEntityStorageKey('SETTINGS'), JSON.stringify(data.settings));
      }

      // 2. Accounts restore
      localStorage.setItem(getEntityStorageKey('ACCOUNTS'), JSON.stringify(data.accounts));

      // 3. Categories restore
      localStorage.setItem(getEntityStorageKey('CATEGORIES'), JSON.stringify(data.categories));

      // 4. Transactions restore
      localStorage.setItem(getEntityStorageKey('TRANSACTIONS'), JSON.stringify(data.transactions));

      // 5. Budgets restore
      localStorage.setItem(getEntityStorageKey('BUDGETS'), JSON.stringify(data.budgets));

      // 6. Broadcast storage sync event so all in-memory providers update immediately
      window.dispatchEvent(new CustomEvent(MONEY_MANAGER_STORAGE_SYNC_EVENT));

      return {
        success: true,
        accountsCount: data.accounts.length,
        categoriesCount: data.categories.length,
        transactionsCount: data.transactions.length,
        budgetsCount: data.budgets.length,
      };
    } catch (err: unknown) {
      console.error('Import failed:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to parse and import backup file. Ensure it is a valid Money Manager export.');
    }
  },

  /**
   * Factory Reset: clears all localStorage keys and re-populates with clean zeroed data
   */
  async factoryReset(): Promise<void> {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(getEntityStorageKey('SETTINGS'));
    localStorage.removeItem(getEntityStorageKey('ACCOUNTS'));
    localStorage.removeItem(getEntityStorageKey('CATEGORIES'));
    localStorage.removeItem(getEntityStorageKey('TRANSACTIONS'));
    localStorage.removeItem(getEntityStorageKey('BUDGETS'));

    // Re-seed clean zero-data state
    localStorage.setItem(
      getEntityStorageKey('SETTINGS'),
      JSON.stringify({
        profile: DEFAULT_USER_PROFILE,
        preferences: DEFAULT_PREFERENCES,
      })
    );
    localStorage.setItem(getEntityStorageKey('ACCOUNTS'), JSON.stringify([]));
    localStorage.setItem(getEntityStorageKey('CATEGORIES'), JSON.stringify(DEFAULT_APP_CATEGORIES));
    localStorage.setItem(getEntityStorageKey('TRANSACTIONS'), JSON.stringify([]));
    localStorage.setItem(getEntityStorageKey('BUDGETS'), JSON.stringify([]));

    // Broadcast storage sync event
    window.dispatchEvent(new CustomEvent(MONEY_MANAGER_STORAGE_SYNC_EVENT));
  },
};
