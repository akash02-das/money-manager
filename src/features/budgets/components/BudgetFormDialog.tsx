'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { budgetFormSchema, type BudgetFormData } from '../schemas/budget-schema';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import type { BudgetWithLiveSpending } from '../context/BudgetsContext';
import { Loader2 } from 'lucide-react';

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth: string;
  budgetToEdit?: BudgetWithLiveSpending | null;
  existingBudgetCategoryIds: string[];
  onSubmit: (data: BudgetFormData) => Promise<void>;
}

const QUICK_AMOUNTS = [3000, 5000, 10000, 15000, 25000, 35000];

export function BudgetFormDialog({
  open,
  onOpenChange,
  selectedMonth,
  budgetToEdit,
  existingBudgetCategoryIds,
  onSubmit,
}: BudgetFormDialogProps) {
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(budgetToEdit);

  // Filter to active expense categories
  const expenseCategories = categories.filter(
    (c) => c.type === 'EXPENSE' && !c.isArchived
  );

  // Available categories: in create mode, hide categories already budgeted for this month
  const availableCategories = isEditMode
    ? expenseCategories
    : expenseCategories.filter((c) => !existingBudgetCategoryIds.includes(c.id));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: availableCategories[0]?.id || '',
      month: selectedMonth,
      limit: 10000,
    },
  });

  useEffect(() => {
    if (open) {
      if (budgetToEdit) {
        reset({
          categoryId: budgetToEdit.categoryId,
          month: budgetToEdit.month,
          limit: budgetToEdit.limit,
        });
      } else {
        reset({
          categoryId: availableCategories[0]?.id || '',
          month: selectedMonth,
          limit: 10000,
        });
      }
    }
  }, [open, budgetToEdit, selectedMonth, reset]);

  const handleFormSubmit = async (values: BudgetFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Adjust Category Budget' : 'Set Category Budget'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update spending cap for ${budgetToEdit?.category?.name || 'this category'}.`
              : 'Allocate a monthly spending target in BDT to keep expenses in check.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-1">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="budget-category">Expense Category *</Label>
            {isEditMode ? (
              <div className="p-2.5 rounded-lg border border-border/80 bg-muted/40 flex items-center gap-2.5 text-xs font-semibold text-foreground">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: budgetToEdit?.category?.color || '#0284c7' }}
                />
                <CategoryIcon
                  name={budgetToEdit?.category?.icon || 'Tag'}
                  className="size-4"
                />
                <span>{budgetToEdit?.category?.name || 'Selected Category'}</span>
              </div>
            ) : (
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val);
                    }}
                  >
                    <SelectTrigger id="budget-category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.categoryId && (
              <p className="text-xs text-rose-500">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Month & Monthly Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Month */}
            <div className="space-y-1.5">
              <Label htmlFor="budget-month">Budget Month *</Label>
              <Input
                id="budget-month"
                type="month"
                disabled={isEditMode}
                {...register('month')}
                aria-invalid={Boolean(errors.month)}
              />
              {errors.month && (
                <p className="text-xs text-rose-500">{errors.month.message}</p>
              )}
            </div>

            {/* Limit */}
            <div className="space-y-1.5">
              <Label htmlFor="budget-limit">Monthly Limit (৳ BDT) *</Label>
              <Input
                id="budget-limit"
                type="number"
                step="500"
                placeholder="10000"
                {...register('limit', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.limit)}
              />
              {errors.limit && (
                <p className="text-xs text-rose-500">{errors.limit.message}</p>
              )}
            </div>
          </div>

          {/* Quick Amount Suggestion Chips */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick Suggestions</Label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue('limit', amt)}
                  className="px-2.5 py-1 rounded-md border border-border/70 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  ৳ {amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditMode ? 'Update Limit' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
