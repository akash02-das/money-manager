import type { Account, CurrencyCode, AccountType } from '@/types/finance';
import { MOCK_ACCOUNTS } from '@/mocks/finance-data';
import type { AccountFormData } from '../schemas/account-schema';

const STORAGE_KEY = 'money_manager_accounts_v1';

export interface CreateAccountDto extends AccountFormData {}
export interface UpdateAccountDto extends Partial<AccountFormData> {
  isArchived?: boolean;
}

/**
 * Helper to safely read from localStorage (client-side only)
 */
function getStoredAccounts(): Account[] {
  if (typeof window === 'undefined') {
    return MOCK_ACCOUNTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic mock accounts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACCOUNTS));
      return MOCK_ACCOUNTS;
    }
    return JSON.parse(raw) as Account[];
  } catch (error) {
    console.error('Failed to load accounts from storage:', error);
    return MOCK_ACCOUNTS;
  }
}

/**
 * Helper to safely write to localStorage
 */
function setStoredAccounts(accounts: Account[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save accounts to storage:', error);
  }
}

/**
 * Accounts Data Access Service
 *
 * NOTE: This service abstracts data operations. Currently it persists to
 * client-side localStorage. When the NestJS API is introduced, these functions
 * will simply make HTTP requests without requiring changes to the UI components.
 */
export const accountsService = {
  async getAll(): Promise<Account[]> {
    // Simulate slight async network delay for realistic UX states
    await new Promise((res) => setTimeout(res, 60));
    return getStoredAccounts();
  },

  async getById(id: string): Promise<Account | null> {
    await new Promise((res) => setTimeout(res, 40));
    const accounts = getStoredAccounts();
    return accounts.find((a) => a.id === id) || null;
  },

  async create(dto: CreateAccountDto): Promise<Account> {
    await new Promise((res) => setTimeout(res, 100));
    const accounts = getStoredAccounts();

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name: dto.name,
      type: dto.type,
      balance: Number(dto.balance),
      currency: (dto.currency as CurrencyCode) || 'BDT',
      institution: dto.institution || undefined,
      accountNumberLast4: dto.accountNumberLast4 || undefined,
      color: dto.color || '#0284c7',
      isArchived: false,
    };

    const updated = [newAccount, ...accounts];
    setStoredAccounts(updated);
    return newAccount;
  },

  async update(id: string, dto: UpdateAccountDto): Promise<Account> {
    await new Promise((res) => setTimeout(res, 100));
    const accounts = getStoredAccounts();
    const index = accounts.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error(`Account with id ${id} not found.`);
    }

    const updatedAccount: Account = {
      ...accounts[index],
      ...dto,
      balance: dto.balance !== undefined ? Number(dto.balance) : accounts[index].balance,
      institution: dto.institution !== undefined ? dto.institution || undefined : accounts[index].institution,
      accountNumberLast4: dto.accountNumberLast4 !== undefined ? dto.accountNumberLast4 || undefined : accounts[index].accountNumberLast4,
    };

    accounts[index] = updatedAccount;
    setStoredAccounts([...accounts]);
    return updatedAccount;
  },

  async toggleArchive(id: string, isArchived: boolean): Promise<Account> {
    return this.update(id, { isArchived });
  },

  async delete(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 100));
    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a) => a.id !== id);
    setStoredAccounts(filtered);
  },

  async resetToDefault(): Promise<Account[]> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACCOUNTS));
    }
    return MOCK_ACCOUNTS;
  },
};
