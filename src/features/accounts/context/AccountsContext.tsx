'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Account, AccountType } from '@/types/finance';
import { accountsService, type CreateAccountDto, type UpdateAccountDto } from '../api/accounts-service';
import { MONEY_MANAGER_STORAGE_SYNC_EVENT } from '@/features/settings/api/settings-service';
import { roundCurrency } from '@/lib/formatters';

interface AccountsContextValue {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  // Mutations
  createAccount: (data: CreateAccountDto) => Promise<Account>;
  updateAccount: (id: string, data: UpdateAccountDto) => Promise<Account>;
  archiveAccount: (id: string, isArchived: boolean) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  // Computed metrics
  totalBalance: number;
  bankAndSavingsTotal: number;
  walletsAndCashTotal: number;
  creditCardTotal: number;
  activeAccountsCount: number;
  archivedAccountsCount: number;
}

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await accountsService.getAll();
      setAccounts(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Synchronize accounts state on backup restore or storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => {
      fetchAccounts();
    };

    window.addEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchAccounts]);

  const createAccount = async (data: CreateAccountDto): Promise<Account> => {
    try {
      const created = await accountsService.create(data);
      setAccounts((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const updateAccount = async (id: string, data: UpdateAccountDto): Promise<Account> => {
    try {
      const updated = await accountsService.update(id, data);
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
      return updated;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const archiveAccount = async (id: string, isArchived: boolean): Promise<Account> => {
    return updateAccount(id, { isArchived });
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await accountsService.delete(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    const data = await accountsService.resetToDefault();
    setAccounts(data);
  };

  // Computations
  const computed = useMemo(() => {
    const active = accounts.filter((a) => !a.isArchived);
    const archived = accounts.filter((a) => a.isArchived);

    let total = 0;
    let bankAndSavings = 0;
    let walletsAndCash = 0;
    let creditCard = 0;

    active.forEach((acc) => {
      total += acc.balance;
      if (acc.type === 'BANK' || acc.type === 'SAVINGS') {
        bankAndSavings += acc.balance;
      } else if (acc.type === 'MOBILE_WALLET' || acc.type === 'CASH') {
        walletsAndCash += acc.balance;
      } else if (acc.type === 'CREDIT_CARD') {
        creditCard += acc.balance;
      }
    });

    return {
      totalBalance: roundCurrency(total),
      bankAndSavingsTotal: roundCurrency(bankAndSavings),
      walletsAndCashTotal: roundCurrency(walletsAndCash),
      creditCardTotal: roundCurrency(creditCard),
      activeAccountsCount: active.length,
      archivedAccountsCount: archived.length,
    };
  }, [accounts]);

  const value: AccountsContextValue = {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    archiveAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts,
    resetToDefault,
    ...computed,
  };

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}
