/**
 * Storage Adapter for Demo vs Verified Account Data Isolation
 * Ensures demo data is saved exclusively in LocalStorage under demo keys
 * and never sent to the backend or mixed with verified user accounts.
 */

export const DEMO_SESSION_KEY = 'money_manager_demo_session_v2';

export const DEMO_STORAGE_KEYS = {
  ACCOUNTS: 'mm_demo_accounts_v2',
  TRANSACTIONS: 'mm_demo_transactions_v2',
  BUDGETS: 'mm_demo_budgets_v2',
  CATEGORIES: 'mm_demo_categories_v2',
  SETTINGS: 'mm_demo_settings_v2',
};

export const VERIFIED_STORAGE_KEYS = {
  ACCOUNTS: 'mm_verified_accounts_v2',
  TRANSACTIONS: 'mm_verified_transactions_v2',
  BUDGETS: 'mm_verified_budgets_v2',
  CATEGORIES: 'mm_verified_categories_v2',
  SETTINGS: 'mm_verified_settings_v2',
};

export function isDemoSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.accountType === 'LOCAL_DEMO';
  } catch {
    return false;
  }
}

export function getEntityStorageKey(
  entity: 'ACCOUNTS' | 'TRANSACTIONS' | 'BUDGETS' | 'CATEGORIES' | 'SETTINGS',
): string {
  if (isDemoSession()) {
    return DEMO_STORAGE_KEYS[entity];
  }
  return VERIFIED_STORAGE_KEYS[entity];
}

/**
 * Default categories provided for all fresh sessions (Demo and Registered)
 * Zero accounts, Zero balances, Zero transactions.
 */
export const DEFAULT_APP_CATEGORIES = [
  { id: 'cat-sal', name: 'Salary & Employment', type: 'INCOME' as const, icon: 'Briefcase', color: '#10b981', isDefault: true, isArchived: false },
  { id: 'cat-con', name: 'Software Consulting', type: 'INCOME' as const, icon: 'Laptop', color: '#06b6d4', isDefault: true, isArchived: false },
  { id: 'cat-hou', name: 'Housing & Rent', type: 'EXPENSE' as const, icon: 'Home', color: '#6366f1', isDefault: true, isArchived: false },
  { id: 'cat-gro', name: 'Groceries & Market', type: 'EXPENSE' as const, icon: 'ShoppingBag', color: '#f59e0b', isDefault: true, isArchived: false },
  { id: 'cat-uti', name: 'Utilities & Internet', type: 'EXPENSE' as const, icon: 'Zap', color: '#ec4899', isDefault: true, isArchived: false },
  { id: 'cat-din', name: 'Dining & Cafes', type: 'EXPENSE' as const, icon: 'UtensilsCrossed', color: '#f97316', isDefault: true, isArchived: false },
  { id: 'cat-tra', name: 'Transportation', type: 'EXPENSE' as const, icon: 'Car', color: '#8b5cf6', isDefault: true, isArchived: false },
  { id: 'cat-hea', name: 'Health & Wellness', type: 'EXPENSE' as const, icon: 'Activity', color: '#14b8a6', isDefault: true, isArchived: false },
];
