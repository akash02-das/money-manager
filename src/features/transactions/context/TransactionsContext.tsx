'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Transaction, Account, Category } from '@/types/finance';
import {
  transactionsService,
  populateTransactionRelations,
  type CreateTransactionDto,
  type UpdateTransactionDto,
} from '../api/transactions-service';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { MONEY_MANAGER_STORAGE_SYNC_EVENT } from '@/features/settings/api/settings-service';
import { roundCurrency } from '@/lib/formatters';

interface TransactionsContextValue {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  // Global modal state (for Quick Add button in Header)
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  // Mutations
  createTransaction: (data: CreateTransactionDto) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionDto) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  // Computed metrics
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  totalCount: number;
  recentTransactions: Transaction[];
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { accounts, refreshAccounts } = useAccounts();
  const { categories } = useCategories();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionsService.getAll();
      const populated = data.map((tx) =>
        populateTransactionRelations(tx, accounts, categories)
      );
      setTransactions(populated);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [accounts, categories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Synchronize transactions state on backup restore or storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => {
      fetchTransactions();
    };

    window.addEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchTransactions]);

  const createTransaction = async (data: CreateTransactionDto): Promise<Transaction> => {
    try {
      const { transaction } = await transactionsService.create(data, accounts, categories);
      setTransactions((prev) => [transaction, ...prev]);
      // Sync accounts balance
      await refreshAccounts();
      return transaction;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    data: UpdateTransactionDto
  ): Promise<Transaction> => {
    try {
      const { transaction } = await transactionsService.update(id, data, accounts, categories);
      setTransactions((prev) => prev.map((t) => (t.id === id ? transaction : t)));
      // Sync accounts balance
      await refreshAccounts();
      return transaction;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      await transactionsService.delete(id, accounts);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      // Sync accounts balance
      await refreshAccounts();
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    const raw = await transactionsService.resetToDefault();
    const populated = raw.map((tx) =>
      populateTransactionRelations(tx, accounts, categories)
    );
    setTransactions(populated);
    await refreshAccounts();
  };

  // Computations
  const computed = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        income += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        expense += tx.amount;
      }
    });

    return {
      totalIncome: roundCurrency(income),
      totalExpense: roundCurrency(expense),
      netCashFlow: roundCurrency(income - expense),
      totalCount: transactions.length,
      recentTransactions: transactions.slice(0, 5),
    };
  }, [transactions]);

  const value: TransactionsContextValue = {
    transactions,
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    resetToDefault,
    ...computed,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
