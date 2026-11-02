import type { Budget } from '@/types/finance';
import type { BudgetFormData } from '../schemas/budget-schema';

const STORAGE_KEY = 'money_manager_budgets_v1';

export const INITIAL_MOCK_BUDGETS: Budget[] = [
  {
    id: 'bgt-1',
    categoryId: 'cat-exp-1', // Housing & Rent
    month: '2026-10',
    limit: 35000,
    spent: 0,
  },
  {
    id: 'bgt-2',
    categoryId: 'cat-exp-2', // Groceries & Market
    month: '2026-10',
    limit: 15000,
    spent: 0,
  },
  {
    id: 'bgt-3',
    categoryId: 'cat-exp-3', // Utilities & Internet
    month: '2026-10',
    limit: 6000,
    spent: 0,
  },
  {
    id: 'bgt-4',
    categoryId: 'cat-exp-4', // Dining & Cafes
    month: '2026-10',
    limit: 2500,
    spent: 0,
  },
  {
    id: 'bgt-5',
    categoryId: 'cat-exp-5', // Transportation
    month: '2026-10',
    limit: 3000,
    spent: 0,
  },
];

export interface CreateBudgetDto extends BudgetFormData {}
export interface UpdateBudgetDto extends Partial<BudgetFormData> {}

function getStoredBudgets(): Budget[] {
  if (typeof window === 'undefined') {
    return INITIAL_MOCK_BUDGETS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_BUDGETS));
      return INITIAL_MOCK_BUDGETS;
    }
    return JSON.parse(raw) as Budget[];
  } catch (error) {
    console.error('Failed to load budgets from storage:', error);
    return INITIAL_MOCK_BUDGETS;
  }
}

function setStoredBudgets(budgets: Budget[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Failed to save budgets to storage:', error);
  }
}

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    await new Promise((res) => setTimeout(res, 40));
    return getStoredBudgets();
  },

  async getByMonth(month: string): Promise<Budget[]> {
    await new Promise((res) => setTimeout(res, 30));
    const budgets = getStoredBudgets();
    return budgets.filter((b) => b.month === month);
  },

  async create(dto: CreateBudgetDto): Promise<Budget> {
    await new Promise((res) => setTimeout(res, 80));
    const budgets = getStoredBudgets();

    // Prevent duplicate budgets for the same category and month
    const existingIndex = budgets.findIndex(
      (b) => b.categoryId === dto.categoryId && b.month === dto.month
    );

    if (existingIndex !== -1) {
      // If already exists, update limit instead
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
    await new Promise((res) => setTimeout(res, 80));
    const budgets = getStoredBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    setStoredBudgets(filtered);
  },

  async resetToDefault(): Promise<Budget[]> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_BUDGETS));
    }
    return INITIAL_MOCK_BUDGETS;
  },
};
