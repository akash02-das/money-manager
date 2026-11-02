import type { Transaction, Account, Category, TransactionType } from '@/types/finance';
import { MOCK_TRANSACTIONS } from '@/mocks/finance-data';
import type { TransactionFormData } from '../schemas/transaction-schema';
import { roundCurrency } from '@/lib/formatters';

const STORAGE_KEY = 'money_manager_transactions_v1';
const ACCOUNTS_STORAGE_KEY = 'money_manager_accounts_v1';

export interface CreateTransactionDto extends TransactionFormData {}
export interface UpdateTransactionDto extends Partial<TransactionFormData> {}

function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return MOCK_TRANSACTIONS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TRANSACTIONS));
      return MOCK_TRANSACTIONS;
    }
    return JSON.parse(raw) as Transaction[];
  } catch (error) {
    console.error('Failed to load transactions from storage:', error);
    return MOCK_TRANSACTIONS;
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

/**
 * Safely normalizes transaction date inputs (YYYY-MM-DD or ISO strings).
 * If a date-only string is provided, pins it to midday local time (12:00:00)
 * so that UTC timezone offsets (e.g. Bangladesh UTC+6) never roll the day across month boundaries.
 */
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

/**
 * Adjust account balances based on transaction type.
 * When reverse is true, the effect is inverted (used for editing or deleting).
 */
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

/**
 * Hydrate relational references on a transaction from live accounts & categories
 */
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

export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    await new Promise((res) => setTimeout(res, 40));
    return getStoredTransactions();
  },

  async getById(id: string): Promise<Transaction | null> {
    await new Promise((res) => setTimeout(res, 30));
    const txs = getStoredTransactions();
    return txs.find((t) => t.id === id) || null;
  },

  async create(
    dto: CreateTransactionDto,
    accounts: Account[],
    categories: Category[]
  ): Promise<{ transaction: Transaction; updatedAccounts: Account[] }> {
    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: Number(dto.amount),
      type: dto.type,
      description: dto.description,
      date: normalizeTransactionDate(dto.date),
      categoryId: dto.categoryId || '',
      accountId: dto.accountId,
      toAccountId: dto.type === 'TRANSFER' ? dto.toAccountId : undefined,
      notes: dto.notes || undefined,
    };

    // 1. Calculate updated account balances
    const updatedAccounts = adjustAccountBalances(newTx, accounts, false);
    saveUpdatedAccounts(updatedAccounts);

    // 2. Prepend new transaction
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
    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();
    const index = transactions.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found.`);
    }

    const oldTx = transactions[index];

    // 1. Reverse old transaction effect
    let intermediateAccounts = adjustAccountBalances(oldTx, accounts, true);

    // 2. Prepare updated transaction
    const updatedTx: Transaction = {
      ...oldTx,
      ...dto,
      amount: dto.amount !== undefined ? Number(dto.amount) : oldTx.amount,
      type: dto.type || oldTx.type,
      description: dto.description || oldTx.description,
      date: dto.date ? normalizeTransactionDate(dto.date) : oldTx.date,
      categoryId: dto.type === 'TRANSFER' ? '' : (dto.categoryId ?? oldTx.categoryId),
      accountId: dto.accountId || oldTx.accountId,
      toAccountId: dto.type === 'TRANSFER' ? (dto.toAccountId ?? oldTx.toAccountId) : undefined,
      notes: dto.notes !== undefined ? dto.notes || undefined : oldTx.notes,
    };

    // 3. Apply new transaction effect
    const updatedAccounts = adjustAccountBalances(updatedTx, intermediateAccounts, false);
    saveUpdatedAccounts(updatedAccounts);

    // 4. Save updated transaction list
    const populated = populateTransactionRelations(updatedTx, updatedAccounts, categories);
    transactions[index] = populated;
    setStoredTransactions([...transactions]);

    return { transaction: populated, updatedAccounts };
  },

  async delete(
    id: string,
    accounts: Account[]
  ): Promise<{ updatedAccounts: Account[] }> {
    await new Promise((res) => setTimeout(res, 80));
    const transactions = getStoredTransactions();
    const target = transactions.find((t) => t.id === id);

    if (!target) {
      throw new Error(`Transaction with id ${id} not found.`);
    }

    // 1. Reverse transaction effect from accounts
    const updatedAccounts = adjustAccountBalances(target, accounts, true);
    saveUpdatedAccounts(updatedAccounts);

    // 2. Remove transaction from list
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
