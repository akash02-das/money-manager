'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  PieChart,
  RotateCcw,
  FolderArchive,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '../hooks/useCategories';
import { CategoryCard } from './CategoryCard';
import { CategoryFormDialog } from './CategoryFormDialog';
import { CategoryDeleteDialog } from './CategoryDeleteDialog';
import { CategoriesSummaryCards } from './CategoriesSummaryCards';
import type { Category, CategoryType } from '@/types/finance';
import type { CategoryFormData } from '../schemas/category-schema';
import { cn } from '@/lib/utils';

type FilterTab = 'ALL' | 'EXPENSE' | 'INCOME' | 'ARCHIVED';

export function CategoriesListView() {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    archivedCategories,
    customCategoriesCount,
    activeCount,
    archivedCount,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
    resetToDefault,
  } = useCategories();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<FilterTab>('ALL');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // 1. Tab filter
      if (selectedTab === 'ARCHIVED') {
        if (!cat.isArchived) return false;
      } else {
        if (cat.isArchived) return false;
        if (selectedTab !== 'ALL' && cat.type !== selectedTab) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return cat.name.toLowerCase().includes(query);
      }

      return true;
    });
  }, [categories, selectedTab, searchQuery]);

  // Actions
  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleToggleArchive = async (category: Category) => {
    await archiveCategory(category.id, !category.isArchived);
  };

  const handlePromptDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const handleArchiveInstead = async () => {
    if (categoryToDelete) {
      await archiveCategory(categoryToDelete.id, true);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PieChart className="size-6 text-primary" />
            Categories
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organize and classify all your income sources, household expenses, and lifestyle spending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Reset categories to default"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">Reset Defaults</span>
          </Button>

          <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-medium shadow-sm">
            <Plus className="size-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <CategoriesSummaryCards
        totalActive={activeCount}
        expenseCount={expenseCategories.length}
        incomeCount={incomeCategories.length}
        customCount={customCategoriesCount}
      />

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedTab('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All Active ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('EXPENSE')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
              selectedTab === 'EXPENSE'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <ArrowUpRight className="size-3.5 text-rose-500" />
            Expense ({expenseCategories.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('INCOME')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
              selectedTab === 'INCOME'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <ArrowDownLeft className="size-3.5 text-emerald-500" />
            Income ({incomeCategories.length})
          </button>

          {archivedCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTab('ARCHIVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
                selectedTab === 'ARCHIVED'
                  ? 'bg-muted-foreground text-background shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <FolderArchive className="size-3.5" />
              Archived ({archivedCount})
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-8 text-xs h-9 bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories Cards Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleOpenEdit}
              onToggleArchive={handleToggleArchive}
              onDelete={handlePromptDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <PieChart className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No categories found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchQuery
              ? `No categories matching "${searchQuery}". Try clearing your search.`
              : selectedTab === 'ARCHIVED'
              ? 'You do not have any archived categories.'
              : 'Create your first custom category to tag your income and expenses.'}
          </p>
          <div className="mt-4 flex gap-2">
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            ) : (
              <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Add Category
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoryToEdit={categoryToEdit}
        onSubmit={handleFormSubmit}
      />

      {/* Delete / Archive Confirmation Dialog */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={categoryToDelete}
        onConfirmDelete={handleConfirmDelete}
        onArchiveInstead={handleArchiveInstead}
      />
    </div>
  );
}
