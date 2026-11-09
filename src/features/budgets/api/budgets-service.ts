import type { Budget } from '@/types/finance';
import type { BudgetFormData } from '../schemas/budget-schema';
import { apiClient, tokenStorage } from '@/lib/api-client';
import { getEntityStorageKey } from '@/lib/storage-adapter';

export interface CreateBudgetDto extends BudgetFormData {}
export interface UpdateBudgetDto extends Partial<BudgetFormData> {}

function getStoredBudgets(): Budget[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const key = getEntityStorageKey('BUDGETS');
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Budget[];
  } catch (error) {
    console.error('Failed to load budgets from storage:', error);
    return [];
  }
}

function setStoredBudgets(budgets: Budget[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getEntityStorageKey('BUDGETS');
    localStorage.setItem(key, JSON.stringify(budgets));
  } catch (error) {
    console.error('Failed to save budgets to storage:', error);
  }
}

function mapApiBudget(raw: any): Budget {
  return {
    id: raw.id,
    categoryId: raw.categoryId,
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
    month: raw.month,
    limit: Number(raw.limit),
    spent: Number(raw.spent || 0),
  };
}

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.get<any[]>('/budgets');
        return raw.map(mapApiBudget);
      } catch (err) {
        console.warn('Backend API failed, falling back to local budgets:', err);
      }
    }
    await new Promise((res) => setTimeout(res, 40));
    return getStoredBudgets();
  },

  async getByMonth(month: string): Promise<Budget[]> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.get<any[]>(`/budgets?month=${month}`);
        return raw.map(mapApiBudget);
      } catch (err) {
        console.warn(`Failed to fetch budgets for month ${month} via API:`, err);
      }
    }
    await new Promise((res) => setTimeout(res, 30));
    const budgets = getStoredBudgets();
    return budgets.filter((b) => b.month === month);
  },

  async create(dto: CreateBudgetDto): Promise<Budget> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.post<any>('/budgets', {
          categoryId: dto.categoryId,
          month: dto.month,
          limit: Number(dto.limit),
        });
        return mapApiBudget(raw);
      } catch (err) {
        console.warn('Failed to create budget via API, storing locally:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const budgets = getStoredBudgets();

    const existingIndex = budgets.findIndex(
      (b) => b.categoryId === dto.categoryId && b.month === dto.month
    );

    if (existingIndex !== -1) {
      budgets[existingIndex].limit = Number(dto.limit);
      setStoredBudgets([...budgets]);
      return budgets[existingIndex];
    }

    const newBudget: Budget = {
      id: `bgt-${Date.now()}`,
      categoryId: dto.categoryId,
      month: dto.month,
      limit: Number(dto.limit),
      spent: 0,
    };

    const updated = [newBudget, ...budgets];
    setStoredBudgets(updated);
    return newBudget;
  },

  async update(id: string, dto: UpdateBudgetDto): Promise<Budget> {
    if (tokenStorage.getAccessToken()) {
      try {
        const raw = await apiClient.patch<any>(`/budgets/${id}`, {
          limit: dto.limit !== undefined ? Number(dto.limit) : undefined,
        });
        return mapApiBudget(raw);
      } catch (err) {
        console.warn(`Failed to update budget ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const budgets = getStoredBudgets();
    const index = budgets.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new Error(`Budget with id ${id} not found.`);
    }

    const updatedBudget: Budget = {
      ...budgets[index],
      ...dto,
      limit: dto.limit !== undefined ? Number(dto.limit) : budgets[index].limit,
    };

    budgets[index] = updatedBudget;
    setStoredBudgets([...budgets]);
    return updatedBudget;
  },

  async delete(id: string): Promise<void> {
    if (tokenStorage.getAccessToken()) {
      try {
        await apiClient.delete(`/budgets/${id}`);
        return;
      } catch (err) {
        console.warn(`Failed to delete budget ${id} via API:`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const budgets = getStoredBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    setStoredBudgets(filtered);
  },

  async resetToDefault(): Promise<Budget[]> {
    setStoredBudgets([]);
    return [];
  },
};
