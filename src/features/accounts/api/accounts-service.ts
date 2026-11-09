import type { Account, CurrencyCode } from '@/types/finance';
import type { AccountFormData } from '../schemas/account-schema';
import { apiClient, tokenStorage } from '@/lib/api-client';
import { getEntityStorageKey, isDemoSession } from '@/lib/storage-adapter';

export interface CreateAccountDto extends AccountFormData {}
export interface UpdateAccountDto extends Partial<AccountFormData> {
  isArchived?: boolean;
}

function getStoredTransactionReferences(): { accountId: string; toAccountId?: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getEntityStorageKey('TRANSACTIONS');
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getStoredAccounts(): Account[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const key = getEntityStorageKey('ACCOUNTS');
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Account[];

    let hasChanges = false;
    const normalized = parsed.map((acc) => {
      if (acc.type === 'CREDIT_CARD' && acc.balance > 0) {
        hasChanges = true;
        return { ...acc, balance: -Math.abs(acc.balance) };
      }
      return acc;
    });

    if (hasChanges) {
      localStorage.setItem(key, JSON.stringify(normalized));
    }

    return normalized;
  } catch (error) {
    console.error('Failed to load accounts from storage:', error);
    return [];
  }
}

function setStoredAccounts(accounts: Account[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getEntityStorageKey('ACCOUNTS');
    localStorage.setItem(key, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save accounts to storage:', error);
  }
}

function mapApiAccount(raw: any): Account {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    balance: Number(raw.balance),
    currency: raw.currency as CurrencyCode,
    institution: raw.institution || undefined,
    accountNumberLast4: raw.accountNumberLast4 || undefined,
    color: raw.color || '#0284c7',
    isArchived: Boolean(raw.isArchived),
  };
}

export const accountsService = {
  async getAll(): Promise<Account[]> {
    if (tokenStorage.getAccessToken()) {
      try {
        const data = await apiClient.get<any[]>('/accounts?includeArchived=true');
        return data.map(mapApiAccount);
      } catch (err) {
        console.warn('Backend API request failed, falling back to local accounts:', err);
      }
    }
    await new Promise((res) => setTimeout(res, 40));
    return getStoredAccounts();
  },

  async getById(id: string): Promise<Account | null> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.get<any>(`/accounts/${id}`);
        return mapApiAccount(raw);
      } catch (err) {
        console.warn(`Failed to fetch account ${id} from API:`, err);
      }
    }
    await new Promise((res) => setTimeout(res, 30));
    const accounts = getStoredAccounts();
    return accounts.find((a) => a.id === id) || null;
  },

  async create(dto: CreateAccountDto): Promise<Account> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.post<any>('/accounts', {
          name: dto.name,
          type: dto.type,
          initialBalance: Number(dto.balance),
          currency: dto.currency || 'BDT',
          institution: dto.institution || undefined,
          accountNumberLast4: dto.accountNumberLast4 || undefined,
          color: dto.color || '#0284c7',
        });
        return mapApiAccount(raw);
      } catch (err) {
        console.warn('Failed to create account via API, storing locally:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const accounts = getStoredAccounts();

    const rawBalance = Number(dto.balance);
    const normalizedBalance =
      dto.type === 'CREDIT_CARD' && rawBalance > 0 ? -rawBalance : rawBalance;

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name: dto.name,
      type: dto.type,
      balance: normalizedBalance,
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
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.patch<any>(`/accounts/${id}`, {
          name: dto.name,
          institution: dto.institution || undefined,
          accountNumberLast4: dto.accountNumberLast4 || undefined,
          color: dto.color,
          isArchived: dto.isArchived,
        });
        return mapApiAccount(raw);
      } catch (err) {
        console.warn(`Failed to update account ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const accounts = getStoredAccounts();
    const index = accounts.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error(`Account with id ${id} not found.`);
    }

    const current = accounts[index];
    const targetType = dto.type || current.type;
    let finalBalance = current.balance;

    if (dto.balance !== undefined) {
      const rawNum = Number(dto.balance);
      finalBalance = targetType === 'CREDIT_CARD' && rawNum > 0 ? -rawNum : rawNum;
    }

    const updatedAccount: Account = {
      ...current,
      ...dto,
      balance: finalBalance,
      institution: dto.institution !== undefined ? dto.institution || undefined : current.institution,
      accountNumberLast4: dto.accountNumberLast4 !== undefined ? dto.accountNumberLast4 || undefined : current.accountNumberLast4,
    };

    accounts[index] = updatedAccount;
    setStoredAccounts([...accounts]);
    return updatedAccount;
  },

  async toggleArchive(id: string, isArchived: boolean): Promise<Account> {
    return this.update(id, { isArchived });
  },

  getLinkedTransactionsCount(id: string): number {
    const txs = getStoredTransactionReferences();
    return txs.filter((t) => t.accountId === id || t.toAccountId === id).length;
  },

  async delete(id: string): Promise<boolean> {
    if (tokenStorage.getAccessToken()) {
      try {
        await apiClient.delete(`/accounts/${id}`);
        return true;
      } catch (err) {
        console.warn(`Failed to delete account ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a) => a.id !== id);

    if (filtered.length === accounts.length) {
      return false;
    }

    setStoredAccounts(filtered);
    return true;
  },

  async resetToDefault(): Promise<Account[]> {
    setStoredAccounts([]);
    return [];
  },
};
