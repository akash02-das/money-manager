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
import { Badge } from '@/components/ui/badge';
import {
  categoryFormSchema,
  type CategoryFormData,
  CATEGORY_COLORS,
  CATEGORY_ICONS_CATALOG,
} from '../schemas/category-schema';
import { CategoryIcon } from './CategoryIcon';
import type { Category, CategoryType } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

const DEFAULT_FORM_VALUES: CategoryFormData = {
  name: '',
  type: 'EXPENSE',
  icon: 'ShoppingBag',
  color: '#f59e0b',
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  categoryToEdit,
  onSubmit,
}: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(categoryToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const selectedType = watch('type');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const watchedName = watch('name');

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        reset({
          name: categoryToEdit.name,
          type: categoryToEdit.type,
          icon: categoryToEdit.icon,
          color: categoryToEdit.color,
        });
      } else {
        reset(DEFAULT_FORM_VALUES);
      }
    }
  }, [open, categoryToEdit, reset]);

  const handleFormSubmit = async (values: CategoryFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
      reset(DEFAULT_FORM_VALUES);
    } catch (error) {
      console.error('Failed to submit category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update category name, icon, or color tag.'
              : 'Add a new Income or Expense category to classify your cash flow.'}
          </DialogDescription>
        </DialogHeader>

        {/* Live Preview Card */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-xl text-white shadow-xs transition-colors"
              style={{ backgroundColor: selectedColor || '#10b981' }}
            >
              <CategoryIcon name={selectedIcon || 'Tag'} className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                {watchedName.trim() || 'Category Name'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-1.5 py-0 h-4 font-normal',
                    selectedType === 'INCOME'
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                      : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5'
                  )}
                >
                  {selectedType === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
                <span className="text-[11px] text-muted-foreground">Preview</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-1">
          {/* Category Type Toggle (Income vs Expense) */}
          <div className="space-y-1.5">
            <Label>Category Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'EXPENSE');
                  if (!selectedIcon || selectedIcon === 'Briefcase') {
                    setValue('icon', 'ShoppingBag');
                    setValue('color', '#f59e0b');
                  }
                }}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  selectedType === 'EXPENSE'
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Expense Category
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue('type', 'INCOME');
                  if (!selectedIcon || selectedIcon === 'ShoppingBag') {
                    setValue('icon', 'Briefcase');
                    setValue('color', '#10b981');
                  }
                }}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  selectedType === 'INCOME'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Income Category
              </button>
            </div>
          </div>

          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Category Name *</Label>
            <Input
              id="category-name"
              placeholder="e.g. Groceries, Freelance, Subscriptions"
              {...register('name')}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Color Palette Selector */}
          <div className="space-y-2">
            <Label>Accent Color *</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => {
                const isSelected = selectedColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue('color', c.value)}
                    className={cn(
                      'size-7 rounded-full transition-all cursor-pointer flex items-center justify-center border-2',
                      isSelected
                        ? 'border-foreground scale-110 shadow-xs'
                        : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {isSelected && (
                      <span className="size-2 rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Picker Grid */}
          <div className="space-y-2">
            <Label>Choose an Icon *</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 rounded-xl border border-border/70 bg-muted/20 max-h-48 overflow-y-auto">
              {CATEGORY_ICONS_CATALOG.map((item) => {
                const isSelected = selectedIcon === item.name;
                const IconComp = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setValue('icon', item.name)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer border',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-xs scale-105'
                        : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                    title={item.label}
                  >
                    <IconComp className="size-5" />
                  </button>
                );
              })}
            </div>
            {errors.icon && (
              <p className="text-xs text-rose-500">{errors.icon.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
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
              {isEditMode ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
