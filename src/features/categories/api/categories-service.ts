import type { Category, CategoryType } from '@/types/finance';
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from '@/mocks/finance-data';
import { INITIAL_MOCK_BUDGETS } from '@/features/budgets/api/budgets-service';
import type { CategoryFormData } from '../schemas/category-schema';

const STORAGE_KEY = 'money_manager_categories_v1';
const TRANSACTIONS_STORAGE_KEY = 'money_manager_transactions_v1';
const BUDGETS_STORAGE_KEY = 'money_manager_budgets_v1';

export interface CreateCategoryDto extends CategoryFormData {}
export interface UpdateCategoryDto extends Partial<CategoryFormData> {
  isArchived?: boolean;
}

function getStoredTransactionReferences(): { categoryId: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return MOCK_TRANSACTIONS;
    return JSON.parse(raw);
  } catch {
    return MOCK_TRANSACTIONS;
  }
}

function getStoredBudgetReferences(): { categoryId: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!raw) return INITIAL_MOCK_BUDGETS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_BUDGETS;
  }
}

/**
 * Safely read stored categories from browser localStorage (client-side only)
 */
function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') {
    return MOCK_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
      return MOCK_CATEGORIES;
    }
    return JSON.parse(raw) as Category[];
  } catch (error) {
    console.error('Failed to load categories from storage:', error);
    return MOCK_CATEGORIES;
  }
}

/**
 * Safely persist categories to browser localStorage
 */
function setStoredCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories to storage:', error);
  }
}

/**
 * Categories Data Access Service
 *
 * NOTE: When the NestJS API is introduced, these functions will simply make
 * HTTP requests, leaving UI components completely unaffected.
 */
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    await new Promise((res) => setTimeout(res, 40));
    return getStoredCategories();
  },

  async getById(id: string): Promise<Category | null> {
    await new Promise((res) => setTimeout(res, 30));
    const categories = getStoredCategories();
    return categories.find((c) => c.id === id) || null;
  },

  async create(dto: CreateCategoryDto): Promise<Category> {
    await new Promise((res) => setTimeout(res, 80));
    const categories = getStoredCategories();

    const newCategory: Category = {
      id: `cat-${dto.type.toLowerCase()}-${Date.now()}`,
      name: dto.name,
      type: dto.type,
      icon: dto.icon,
      color: dto.color,
      isDefault: false,
      isArchived: false,
    };

    const updated = [newCategory, ...categories];
    setStoredCategories(updated);
    return newCategory;
  },

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await new Promise((res) => setTimeout(res, 80));
    const categories = getStoredCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error(`Category with id ${id} not found.`);
    }

    const updatedCategory: Category = {
      ...categories[index],
      ...dto,
    };

    categories[index] = updatedCategory;
    setStoredCategories([...categories]);
    return updatedCategory;
  },

  async toggleArchive(id: string, isArchived: boolean): Promise<Category> {
    return this.update(id, { isArchived });
  },

  getLinkedTransactionsCount(id: string): number {
    const txs = getStoredTransactionReferences();
    return txs.filter((t) => t.categoryId === id).length;
  },

  getLinkedBudgetsCount(id: string): number {
    const budgets = getStoredBudgetReferences();
    return budgets.filter((b) => b.categoryId === id).length;
  },

  async delete(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 80));
    const categories = getStoredCategories();
    const target = categories.find((c) => c.id === id);

    if (!target) {
      throw new Error(`Category with id ${id} not found.`);
    }

    if (target.isDefault) {
      throw new Error('Default system categories cannot be deleted. You can archive them instead.');
    }

    const linkedTxCount = this.getLinkedTransactionsCount(id);
    if (linkedTxCount > 0) {
      throw new Error(
        `Cannot delete category "${target.name}" because it is linked to ${linkedTxCount} transaction(s). Please archive it instead to preserve your transaction reports.`
      );
    }

    const linkedBudgetCount = this.getLinkedBudgetsCount(id);
    if (linkedBudgetCount > 0) {
      throw new Error(
        `Cannot delete category "${target.name}" because it is linked to ${linkedBudgetCount} active budget cap(s). Please remove the budgets or archive this category instead.`
      );
    }

    const filtered = categories.filter((c) => c.id !== id);
    setStoredCategories(filtered);
  },

  async resetToDefault(): Promise<Category[]> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
    }
    return MOCK_CATEGORIES;
  },
};
