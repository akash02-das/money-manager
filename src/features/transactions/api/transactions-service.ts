import type { Transaction, Account, Category, TransactionType } from '@/types/finance';
import { MOCK_TRANSACTIONS } from '@/mocks/finance-data';
import type { TransactionFormData } from '../schemas/transaction-schema';
import { roundCurrency } from '@/lib/formatters';
import { apiClient, tokenStorage } from '@/lib/api-client';

const STORAGE_KEY = 'money_manager_transactions_v1';
const ACCOUNTS_STORAGE_KEY = 'money_manager_accounts_v1';

export interface CreateTransactionDto extends TransactionFormData {}
export interface UpdateTransactionDto extends Partial<TransactionFormData> {}

function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Transaction[];
  } catch (error) {
    console.error('Failed to load transactions from storage:', error);
    return [];
  }
}

function setStoredTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions to storage:', error);
  }
}

function saveUpdatedAccounts(accounts: Account[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to update accounts in storage:', error);
  }
}

function normalizeTransactionDate(dateInput?: string): string {
  if (!dateInput) return new Date().toISOString();
  if (dateInput.includes('T')) {
    return new Date(dateInput).toISOString();
  }
  const parts = dateInput.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const [year, month, day] = parts;
    const localMidday = new Date(year, month - 1, day, 12, 0, 0);
    return localMidday.toISOString();
  }
  return new Date(dateInput).toISOString();
}

function adjustAccountBalances(
  tx: { type: TransactionType; amount: number; accountId: string; toAccountId?: string },
  currentAccounts: Account[],
  reverse = false
): Account[] {
  const multiplier = reverse ? -1 : 1;
  const accountsCopy = currentAccounts.map((a) => ({ ...a }));

  if (tx.type === 'EXPENSE') {
    const account = accountsCopy.find((a) => a.id === tx.accountId);
    if (account) {
      account.balance = roundCurrency(account.balance - tx.amount * multiplier);
    }
  } else if (tx.type === 'INCOME') {
    const account = accountsCopy.find((a) => a.id === tx.accountId);
    if (account) {
      account.balance = roundCurrency(account.balance + tx.amount * multiplier);
    }
  } else if (tx.type === 'TRANSFER' && tx.toAccountId) {
    const fromAccount = accountsCopy.find((a) => a.id === tx.accountId);
    const toAccount = accountsCopy.find((a) => a.id === tx.toAccountId);
    if (fromAccount) {
      fromAccount.balance = roundCurrency(fromAccount.balance - tx.amount * multiplier);
    }
    if (toAccount) {
      toAccount.balance = roundCurrency(toAccount.balance + tx.amount * multiplier);
    }
  }

  return accountsCopy;
}

export function populateTransactionRelations(
  tx: Transaction,
  accounts: Account[],
  categories: Category[]
): Transaction {
  const category = categories.find((c) => c.id === tx.categoryId);
  const account = accounts.find((a) => a.id === tx.accountId);
  const toAccount = tx.toAccountId
    ? accounts.find((a) => a.id === tx.toAccountId)
    : undefined;

  return {
    ...tx,
    category,
    account,
    toAccount,
  };
}

function mapApiTransaction(raw: any): Transaction {
  return {
    id: raw.id,
    amount: Number(raw.amount),
    type: raw.type as TransactionType,
    description: raw.description,
    date: raw.date,
    categoryId: raw.categoryId || '',
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          type: raw.category.type,
          icon: raw.category.icon,
          color: raw.category.color,
          isDefault: Boolean(raw.category.isDefault),
          isArchived: Boolean(raw.category.isArchived),
        }
      : undefined,
    accountId: raw.accountId,
    account: raw.account
      ? {
          id: raw.account.id,
          name: raw.account.name,
          type: raw.account.type,
          balance: Number(raw.account.balance),
          currency: raw.account.currency,
          institution: raw.account.institution || undefined,
          accountNumberLast4: raw.accountNumberLast4 || undefined,
          color: raw.account.color,
          isArchived: Boolean(raw.account.isArchived),
        }
      : undefined,
    toAccountId: raw.toAccountId || undefined,
    toAccount: raw.toAccount
      ? {
          id: raw.toAccount.id,
          name: raw.toAccount.name,
          type: raw.toAccount.type,
          balance: Number(raw.toAccount.balance),
          currency: raw.toAccount.currency,
          institution: raw.toAccount.institution || undefined,
          accountNumberLast4: raw.accountNumberLast4 || undefined,
          color: raw.toAccount.color,
          isArchived: Boolean(raw.toAccount.isArchived),
        }
      : undefined,
    notes: raw.notes || undefined,
  };
}

export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    if (tokenStorage.getAccessToken()) {
      try {
        const res = await apiClient.get<{ items: any[]; total: number }>(
          '/transactions?limit=250',
        );
        if (res?.items) {
          return res.items.map(mapApiTransaction);
        }
      } catch (err) {
        console.warn('Backend API failed, falling back to local transactions:', err);
      }
    }
    await new Promise((res) => setTimeout(res, 40));
    return getStoredTransactions();
  },

  async getById(id: string): Promise<Transaction | null> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.get<any>(`/transactions/${id}`);
        return mapApiTransaction(raw);
      } catch (err) {
        console.warn(`Failed to fetch transaction ${id} from API:`, err);
      }
    }
    await new Promise((res) => setTimeout(res, 30));
    const txs = getStoredTransactions();
    return txs.find((t) => t.id === id) || null;
  },

  async create(
    dto: CreateTransactionDto,
    accounts: Account[],
    categories: Category[]
  ): Promise<{ transaction: Transaction; updatedAccounts: Account[] }> {
    const normalizedDate = normalizeTransactionDate(dto.date);

    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.post<any>('/transactions', {
          type: dto.type,
          amount: Number(dto.amount),
          description: dto.description,
          date: normalizedDate,
          accountId: dto.accountId,
          toAccountId: dto.type === 'TRANSFER' ? dto.toAccountId : undefined,
          categoryId: dto.type !== 'TRANSFER' ? dto.categoryId : undefined,
          notes: dto.notes || undefined,
        });

        const mappedTx = mapApiTransaction(raw);
        // Calculate updated accounts client-side for immediate responsive UI feedback
        const updatedAccounts = adjustAccountBalances(mappedTx, accounts, false);
        return { transaction: mappedTx, updatedAccounts };
      } catch (err) {
        console.warn('Failed to create transaction via API, storing locally:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: Number(dto.amount),
      type: dto.type,
      description: dto.description,
      date: normalizedDate,
      categoryId: dto.categoryId || '',
      accountId: dto.accountId,
      toAccountId: dto.type === 'TRANSFER' ? dto.toAccountId : undefined,
      notes: dto.notes || undefined,
    };

    const updatedAccounts = adjustAccountBalances(newTx, accounts, false);
    saveUpdatedAccounts(updatedAccounts);

    const populated = populateTransactionRelations(newTx, updatedAccounts, categories);
    const updatedTransactions = [populated, ...transactions];
    setStoredTransactions(updatedTransactions);

    return { transaction: populated, updatedAccounts };
  },

  async update(
    id: string,
    dto: UpdateTransactionDto,
    accounts: Account[],
    categories: Category[]
  ): Promise<{ transaction: Transaction; updatedAccounts: Account[] }> {
    const normalizedDate = dto.date ? normalizeTransactionDate(dto.date) : undefined;

    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.patch<any>(`/transactions/${id}`, {
          type: dto.type,
          amount: dto.amount !== undefined ? Number(dto.amount) : undefined,
          description: dto.description,
          date: normalizedDate,
          accountId: dto.accountId,
          toAccountId: dto.toAccountId,
          categoryId: dto.categoryId,
          notes: dto.notes,
        });

        const mappedTx = mapApiTransaction(raw);
        const oldTx = accounts.find((a) => a.id === mappedTx.accountId);
        // Compute updated balances
        const intermediate = adjustAccountBalances(mappedTx, accounts, false);
        return { transaction: mappedTx, updatedAccounts: intermediate };
      } catch (err) {
        console.warn(`Failed to update transaction ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();
    const index = transactions.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found.`);
    }

    const oldTx = transactions[index];
    const intermediateAccounts = adjustAccountBalances(oldTx, accounts, true);

    const updatedTx: Transaction = {
      ...oldTx,
      ...dto,
      amount: dto.amount !== undefined ? Number(dto.amount) : oldTx.amount,
      type: dto.type || oldTx.type,
      description: dto.description || oldTx.description,
      date: normalizedDate || oldTx.date,
      categoryId: dto.type === 'TRANSFER' ? '' : (dto.categoryId ?? oldTx.categoryId),
      accountId: dto.accountId || oldTx.accountId,
      toAccountId: dto.type === 'TRANSFER' ? (dto.toAccountId ?? oldTx.toAccountId) : undefined,
      notes: dto.notes !== undefined ? dto.notes || undefined : oldTx.notes,
    };

    const updatedAccounts = adjustAccountBalances(updatedTx, intermediateAccounts, false);
    saveUpdatedAccounts(updatedAccounts);

    const populated = populateTransactionRelations(updatedTx, updatedAccounts, categories);
    transactions[index] = populated;
    setStoredTransactions([...transactions]);

    return { transaction: populated, updatedAccounts };
  },

  async delete(
    id: string,
    accounts: Account[]
  ): Promise<{ updatedAccounts: Account[] }> {
    if (tokenStorage.getAccessToken()) {
      try {
        await apiClient.delete(`/transactions/${id}`);
      } catch (err) {
        console.warn(`Failed to delete transaction ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();
    const target = transactions.find((t) => t.id === id);

    if (!target) {
      return { updatedAccounts: accounts };
    }

    const updatedAccounts = adjustAccountBalances(target, accounts, true);
    saveUpdatedAccounts(updatedAccounts);

    const filtered = transactions.filter((t) => t.id !== id);
    setStoredTransactions(filtered);

    return { updatedAccounts };
  },

  async resetToDefault(): Promise<Transaction[]> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TRANSACTIONS));
    }
    return MOCK_TRANSACTIONS;
  },
};
