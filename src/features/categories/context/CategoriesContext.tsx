'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Category, CategoryType } from '@/types/finance';
import { DEFAULT_APP_CATEGORIES } from '@/lib/storage-adapter';
import { categoriesService, type CreateCategoryDto, type UpdateCategoryDto } from '../api/categories-service';
import { MONEY_MANAGER_STORAGE_SYNC_EVENT } from '@/features/settings/api/settings-service';

interface CategoriesContextValue {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  // Mutations
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  archiveCategory: (id: string, isArchived: boolean) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  // Computed collections & counts
  incomeCategories: Category[];
  expenseCategories: Category[];
  archivedCategories: Category[];
  customCategoriesCount: number;
  activeCount: number;
  archivedCount: number;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_APP_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Synchronize categories state on backup restore or storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => {
      fetchCategories();
    };

    window.addEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(MONEY_MANAGER_STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchCategories]);

  const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
    try {
      const created = await categoriesService.create(data);
      setCategories((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    try {
      const updated = await categoriesService.update(id, data);
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
      return updated;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const archiveCategory = async (id: string, isArchived: boolean): Promise<Category> => {
    return updateCategory(id, { isArchived });
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await categoriesService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    const data = await categoriesService.resetToDefault();
    setCategories(data);
  };

  // Computations
  const computed = useMemo(() => {
    const active = categories.filter((c) => !c.isArchived);
    const archived = categories.filter((c) => c.isArchived);
    const income = active.filter((c) => c.type === 'INCOME');
    const expense = active.filter((c) => c.type === 'EXPENSE');
    const custom = active.filter((c) => !c.isDefault);

    return {
      incomeCategories: income,
      expenseCategories: expense,
      archivedCategories: archived,
      customCategoriesCount: custom.length,
      activeCount: active.length,
      archivedCount: archived.length,
    };
  }, [categories]);

  const value: CategoriesContextValue = {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
    resetToDefault,
    ...computed,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
