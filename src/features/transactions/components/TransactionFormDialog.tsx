'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import {
  transactionFormSchema,
  type TransactionFormData,
} from '../schemas/transaction-schema';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import type { Transaction, TransactionType } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: Transaction | null;
  onSubmit: (data: TransactionFormData) => Promise<void>;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transactionToEdit,
  onSubmit,
}: TransactionFormDialogProps) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(transactionToEdit);

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const activeCategories = categories.filter((c) => !c.isArchived);
  const defaultExpenseCat = activeCategories.find((c) => c.type === 'EXPENSE');

  const defaultDateStr = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: 0,
      description: '',
      date: defaultDateStr,
      accountId: activeAccounts[0]?.id || '',
      toAccountId: '',
      categoryId: defaultExpenseCat?.id || '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedAccountId = watch('accountId');
  const selectedCategoryId = watch('categoryId');

  // Filter categories by selected transaction type
  const matchingCategories = useMemo(() => {
    return activeCategories.filter(
      (c) => c.type === (selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE')
    );
  }, [activeCategories, selectedType]);

  // Synchronize categoryId whenever selectedType changes to prevent cross-type leakage
  useEffect(() => {
    if (!open) return;

    if (selectedType === 'TRANSFER') {
      if (selectedCategoryId) {
        setValue('categoryId', '', { shouldValidate: true });
      }
      return;
    }

    const isValidMatch = matchingCategories.some((c) => c.id === selectedCategoryId);
    if (!isValidMatch && matchingCategories.length > 0) {
      setValue('categoryId', matchingCategories[0].id, { shouldValidate: true });
    }
  }, [open, selectedType, selectedCategoryId, matchingCategories, setValue]);

  // Seamless handler for switching transaction types
  const handleTypeChange = (newType: TransactionType) => {
    setValue('type', newType, { shouldValidate: true, shouldDirty: true });

    if (newType === 'TRANSFER') {
      setValue('categoryId', '', { shouldValidate: true, shouldDirty: true });
      const eligibleAccounts = activeAccounts.filter((a) => a.id !== selectedAccountId);
      if (eligibleAccounts.length > 0) {
        setValue('toAccountId', eligibleAccounts[0].id, { shouldValidate: true, shouldDirty: true });
      }
    } else {
      setValue('toAccountId', '', { shouldValidate: true, shouldDirty: true });
      const validCategories = activeCategories.filter((c) => c.type === newType);
      const isCurrentValid = validCategories.some((c) => c.id === selectedCategoryId);
      if (!isCurrentValid && validCategories.length > 0) {
        setValue('categoryId', validCategories[0].id, { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        let dateStr = defaultDateStr;
        try {
          dateStr = format(new Date(transactionToEdit.date), 'yyyy-MM-dd');
        } catch {
          dateStr = defaultDateStr;
        }

        reset({
          type: transactionToEdit.type,
          amount: transactionToEdit.amount,
          description: transactionToEdit.description,
          date: dateStr,
          accountId: transactionToEdit.accountId,
          toAccountId: transactionToEdit.toAccountId || '',
          categoryId: transactionToEdit.categoryId || '',
          notes: transactionToEdit.notes || '',
        });
      } else {
        const initialExpCat = activeCategories.find((c) => c.type === 'EXPENSE');
        reset({
          type: 'EXPENSE',
          amount: 0,
          description: '',
          date: defaultDateStr,
          accountId: activeAccounts[0]?.id || '',
          toAccountId: '',
          categoryId: initialExpCat?.id || '',
          notes: '',
        });
      }
    }
  }, [open, transactionToEdit, reset, defaultDateStr, activeAccounts, activeCategories]);

  const handleFormSubmit = async (values: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Transaction' : 'Record New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update transaction amount, account, or category classification.'
              : 'Add an expense, income, or transfer. Account balances will update automatically.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-1">
          {/* Transaction Type Tabs */}
          <div className="space-y-1.5">
            <Label>Transaction Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  selectedType === 'EXPENSE'
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                <ArrowUpRight className="size-3.5" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  selectedType === 'INCOME'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                <ArrowDownLeft className="size-3.5" />
                <span>Income</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('TRANSFER')}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  selectedType === 'TRANSFER'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                <ArrowLeftRight className="size-3.5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Amount & Date in 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Amount (৳ BDT) *</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.amount)}
              />
              {errors.amount && (
                <p className="text-xs text-rose-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Transaction Date *</Label>
              <Input
                id="tx-date"
                type="date"
                {...register('date')}
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date && (
                <p className="text-xs text-rose-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-description">Description *</Label>
            <Input
              id="tx-description"
              placeholder="e.g. Monthly Grocery at Unimart, Consulting retainer"
              {...register('description')}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-rose-500">{errors.description.message}</p>
            )}
          </div>

          {/* Accounts & Category Section */}
          {selectedType === 'TRANSFER' ? (
            /* Transfer: From Account & To Account */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              {/* From Account */}
              <div className="space-y-1.5">
                <Label htmlFor="tx-from-account">From Account *</Label>
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (val) field.onChange(val);
                      }}
                    >
                      <SelectTrigger id="tx-from-account" className="w-full">
                        <SelectValue placeholder="Source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.accountId && (
                  <p className="text-xs text-rose-500">{errors.accountId.message}</p>
                )}
              </div>

              {/* To Account */}
              <div className="space-y-1.5">
                <Label htmlFor="tx-to-account">To Account *</Label>
                <Controller
                  control={control}
                  name="toAccountId"
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={(val) => {
                        if (val) field.onChange(val);
                      }}
                    >
                      <SelectTrigger id="tx-to-account" className="w-full">
                        <SelectValue placeholder="Destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts
                          .filter((acc) => acc.id !== selectedAccountId)
                          .map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.toAccountId && (
                  <p className="text-xs text-rose-500">{errors.toAccountId.message}</p>
                )}
              </div>
            </div>
          ) : (
            /* Income or Expense: Account & Category */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account */}
              <div className="space-y-1.5">
                <Label htmlFor="tx-account">
                  {selectedType === 'INCOME' ? 'Deposit To Account *' : 'Paid From Account *'}
                </Label>
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (val) field.onChange(val);
                      }}
                    >
                      <SelectTrigger id="tx-account" className="w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.accountId && (
                  <p className="text-xs text-rose-500">{errors.accountId.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="tx-category">Category *</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      key={`tx-cat-select-${selectedType}`}
                      value={field.value || ''}
                      onValueChange={(val) => {
                        if (val) field.onChange(val);
                      }}
                    >
                      <SelectTrigger id="tx-category" className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {matchingCategories.map((cat) => (
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
                {errors.categoryId && (
                  <p className="text-xs text-rose-500">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Notes (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-notes">Notes & Memo (Optional)</Label>
            <Input
              id="tx-notes"
              placeholder="e.g. Invoice #204, split with friend, etc."
              {...register('notes')}
              aria-invalid={Boolean(errors.notes)}
            />
            {errors.notes && (
              <p className="text-xs text-rose-500">{errors.notes.message}</p>
            )}
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
              {isEditMode ? 'Save Changes' : 'Record Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
