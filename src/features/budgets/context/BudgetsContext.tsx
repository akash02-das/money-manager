'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { format, addMonths, subMonths, parse } from 'date-fns';
import type { Budget, Category } from '@/types/finance';
import {
  budgetsService,
  INITIAL_MOCK_BUDGETS,
  type CreateBudgetDto,
  type UpdateBudgetDto,
} from '../api/budgets-service';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { MONEY_MANAGER_STORAGE_SYNC_EVENT } from '@/features/settings/api/settings-service';
import { getLocalMonthKey, roundCurrency } from '@/lib/formatters';

export type BudgetHealthStatus = 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET';

export interface BudgetWithLiveSpending extends Budget {
  category?: Category;
  liveSpent: number;
  remaining: number;
  percentage: number;
  status: BudgetHealthStatus;
}

interface BudgetsContextValue {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  // Month selector
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  // Computed budgets for active month with live transactions sync
  monthBudgets: BudgetWithLiveSpending[];
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  onTrackCount: number;
  warningCount: number;
  overBudgetCount: number;
  activeMonthBudgetsCount: number;
  // Mutations
  createBudget: (data: CreateBudgetDto) => Promise<Budget>;
  updateBudget: (id: string, data: UpdateBudgetDto) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
}

const BudgetsContext = createContext<BudgetsContextValue | undefined>(undefined);

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_MOCK_BUDGETS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await budgetsService.getAll();
      setBudgets(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load budgets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Synchronize budgets state on backup restore or storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => {
      fetchBudgets();
    };

    window.addEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchBudgets]);

  // Month navigation helpers
  const goToPreviousMonth = () => {
    try {
      const parsed = parse(`${selectedMonth}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1));
      const prev = subMonths(parsed, 1);
      setSelectedMonth(format(prev, 'yyyy-MM'));
    } catch {
      // fallback
    }
  };

  const goToNextMonth = () => {
    try {
      const parsed = parse(`${selectedMonth}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1));
      const next = addMonths(parsed, 1);
      setSelectedMonth(format(next, 'yyyy-MM'));
    } catch {
      // fallback
    }
  };

  const createBudget = async (data: CreateBudgetDto): Promise<Budget> => {
    try {
      const created = await budgetsService.create(data);
      setBudgets((prev) => {
        const filtered = prev.filter(
          (b) => !(b.categoryId === created.categoryId && b.month === created.month)
        );
        return [created, ...filtered];
      });
      return created;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const updateBudget = async (id: string, data: UpdateBudgetDto): Promise<Budget> => {
    try {
      const updated = await budgetsService.update(id, data);
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      return updated;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const deleteBudget = async (id: string): Promise<void> => {
    try {
      await budgetsService.delete(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    const defaultData = await budgetsService.resetToDefault();
    setBudgets(defaultData);
  };

  // Compute live spending per budget for the selected month
  const monthBudgets = useMemo<BudgetWithLiveSpending[]>(() => {
    const rawForMonth = budgets.filter((b) => b.month === selectedMonth);

    return rawForMonth.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);

      // Sum all EXPENSE transactions for this category in the selected month
      // using timezone-aware calendar month matching (e.g. Asia/Dhaka GMT+6)
      let actualSpent = 0;
      transactions.forEach((tx) => {
        const txMonth = getLocalMonthKey(tx.date);
        if (
          tx.type === 'EXPENSE' &&
          tx.categoryId === budget.categoryId &&
          txMonth === selectedMonth
        ) {
          actualSpent += tx.amount;
        }
      });

      // The live transactions ledger is the single source of truth for spending.
      // If 0 transactions exist for this category in this month, spent is strictly 0.
      const finalSpent = roundCurrency(actualSpent);
      const remaining = roundCurrency(budget.limit - finalSpent);
      const percentage = budget.limit > 0 ? (finalSpent / budget.limit) * 100 : 0;

      let status: BudgetHealthStatus = 'ON_TRACK';
      if (percentage > 100) {
        status = 'OVER_BUDGET';
      } else if (percentage >= 80) {
        status = 'WARNING';
      }

      return {
        ...budget,
        category,
        liveSpent: finalSpent,
        remaining,
        percentage,
        status,
      };
    });
  }, [budgets, selectedMonth, categories, transactions]);

  // Overall Month Computations
  const computedTotals = useMemo(() => {
    let allocated = 0;
    let spent = 0;
    let onTrack = 0;
    let warning = 0;
    let over = 0;

    monthBudgets.forEach((b) => {
      allocated += b.limit;
      spent += b.liveSpent;
      if (b.status === 'OVER_BUDGET') {
        over += 1;
      } else if (b.status === 'WARNING') {
        warning += 1;
      } else {
        onTrack += 1;
      }
    });

    const remaining = roundCurrency(allocated - spent);
    const overallPct = allocated > 0 ? (spent / allocated) * 100 : 0;

    return {
      totalBudget: roundCurrency(allocated),
      totalSpent: roundCurrency(spent),
      totalRemaining: remaining,
      overallPercentage: overallPct,
      onTrackCount: onTrack,
      warningCount: warning,
      overBudgetCount: over,
      activeMonthBudgetsCount: monthBudgets.length,
    };
  }, [monthBudgets]);

  const value: BudgetsContextValue = {
    budgets,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    monthBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    resetToDefault,
    refreshBudgets: fetchBudgets,
    ...computedTotals,
  };

  return (
    <BudgetsContext.Provider value={value}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
}
