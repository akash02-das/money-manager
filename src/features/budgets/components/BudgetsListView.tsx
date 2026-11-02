'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Target,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { parse, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBudgets } from '../hooks/useBudgets';
import type { BudgetWithLiveSpending, BudgetHealthStatus } from '../context/BudgetsContext';
import { BudgetsSummaryCards } from './BudgetsSummaryCards';
import { BudgetCard } from './BudgetCard';
import { BudgetFormDialog } from './BudgetFormDialog';
import { BudgetDeleteDialog } from './BudgetDeleteDialog';
import type { BudgetFormData } from '../schemas/budget-schema';
import { cn } from '@/lib/utils';

type FilterStatus = 'ALL' | BudgetHealthStatus;

export function BudgetsListView() {
  const {
    monthBudgets,
    totalBudget,
    totalSpent,
    totalRemaining,
    overallPercentage,
    onTrackCount,
    warningCount,
    overBudgetCount,
    activeMonthBudgetsCount,
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    createBudget,
    updateBudget,
    deleteBudget,
    resetToDefault,
  } = useBudgets();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');

  // Modal Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetWithLiveSpending | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetWithLiveSpending | null>(null);

  // Formatted human-readable month string (e.g. "October 2026")
  const formattedMonthLabel = useMemo(() => {
    try {
      const parsedDate = parse(`${selectedMonth}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1));
      return format(parsedDate, 'MMMM yyyy');
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // Filter budgets based on search & health status
  const filteredBudgets = useMemo(() => {
    return monthBudgets.filter((b) => {
      // Category Name Search
      const matchesSearch =
        !searchQuery.trim() ||
        (b.category?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase().trim());

      // Health status filter
      const matchesStatus =
        selectedStatus === 'ALL' || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [monthBudgets, searchQuery, selectedStatus]);

  // Existing budgeted category IDs for this month (to prevent duplicates in create modal)
  const existingCategoryIds = useMemo(() => {
    return monthBudgets.map((b) => b.categoryId);
  }, [monthBudgets]);

  // Action handlers
  const handleOpenCreate = () => {
    setBudgetToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (budget: BudgetWithLiveSpending) => {
    setBudgetToEdit(budget);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (budget: BudgetWithLiveSpending) => {
    setBudgetToDelete(budget);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: BudgetFormData) => {
    if (budgetToEdit) {
      await updateBudget(budgetToEdit.id, {
        limit: data.limit,
      });
    } else {
      await createBudget({
        categoryId: data.categoryId,
        month: data.month,
        limit: data.limit,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (budgetToDelete) {
      await deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Month Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Budgets & Spending Limits</span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary">
              {activeMonthBudgetsCount} active
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Allocate category budgets in BDT (৳) and monitor live expenses in real-time.
          </p>
        </div>

        {/* Month Navigator & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Switcher Pill */}
          <div className="flex items-center rounded-xl border border-border bg-card shadow-xs p-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={goToPreviousMonth}
              title="Previous Month"
              className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous Month</span>
            </Button>

            <div className="flex items-center gap-1.5 px-3 font-semibold text-sm text-foreground select-none min-w-[140px] justify-center">
              <Calendar className="size-3.5 text-primary" />
              <span>{formattedMonthLabel}</span>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={goToNextMonth}
              title="Next Month"
              className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next Month</span>
            </Button>
          </div>

          {/* Quick Demo Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            title="Reset to default mock budgets"
            className="cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </Button>

          {/* Add Category Budget CTA */}
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="cursor-pointer gap-1.5 shadow-sm font-semibold h-9"
          >
            <Plus className="size-4" />
            <span>Set Budget</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <BudgetsSummaryCards
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
        overallPercentage={overallPercentage}
        budgetCount={activeMonthBudgetsCount}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
          <button
            type="button"
            onClick={() => setSelectedStatus('ALL')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              selectedStatus === 'ALL'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>All Budgets</span>
            <span className="text-[10px] opacity-75 font-mono">({monthBudgets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('ON_TRACK')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              selectedStatus === 'ON_TRACK'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            <span>On Track</span>
            <span className="text-[10px] opacity-75 font-mono">({onTrackCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('WARNING')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              selectedStatus === 'WARNING'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="size-2 rounded-full bg-amber-500 inline-block" />
            <span>Near Limit</span>
            <span className="text-[10px] opacity-75 font-mono">({warningCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('OVER_BUDGET')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              selectedStatus === 'OVER_BUDGET'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="size-2 rounded-full bg-rose-500 inline-block" />
            <span>Over Budget</span>
            <span className="text-[10px] opacity-75 font-mono">({overBudgetCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Grid of Budget Cards or Empty State */}
      {monthBudgets.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
            <Target className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            No Budgets Set for {formattedMonthLabel}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            You haven&apos;t allocated category spending caps for this month yet. Establish
            spending targets to track expenditures and prevent overspending.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleOpenCreate} className="gap-2 cursor-pointer">
              <Plus className="size-4" />
              <span>Set First Category Budget</span>
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefault}
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>Seed Sample Budgets</span>
            </Button>
          </div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="rounded-2xl border border-border/80 p-10 text-center bg-card/40">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <AlertCircle className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No Budgets Match Your Filter
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            No category budgets found with status &ldquo;{selectedStatus}&rdquo;
            {searchQuery ? ` matching "${searchQuery}"` : ''}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="cursor-pointer text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <BudgetFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        selectedMonth={selectedMonth}
        budgetToEdit={budgetToEdit}
        existingBudgetCategoryIds={existingCategoryIds}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <BudgetDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        budget={budgetToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
