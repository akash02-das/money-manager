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
import {
  accountFormSchema,
  type AccountFormData,
  ACCOUNT_COLORS,
} from '../schemas/account-schema';
import type { Account, AccountType } from '@/types/finance';
import { ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: Account | null;
  onSubmit: (data: AccountFormData) => Promise<void>;
}

const DEFAULT_FORM_VALUES: AccountFormData = {
  name: '',
  type: 'BANK',
  balance: 0,
  currency: 'BDT',
  institution: '',
  accountNumberLast4: '',
  color: '#0284c7',
};

export function AccountFormDialog({
  open,
  onOpenChange,
  accountToEdit,
  onSubmit,
}: AccountFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(accountToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const selectedColor = watch('color');
  const selectedType = watch('type');

  // Reset or populate form when dialog opens or accountToEdit changes
  useEffect(() => {
    if (open) {
      if (accountToEdit) {
        reset({
          name: accountToEdit.name,
          type: accountToEdit.type,
          balance: accountToEdit.balance,
          currency: 'BDT',
          institution: accountToEdit.institution || '',
          accountNumberLast4: accountToEdit.accountNumberLast4 || '',
          color: accountToEdit.color || '#0284c7',
        });
      } else {
        reset(DEFAULT_FORM_VALUES);
      }
    }
  }, [open, accountToEdit, reset]);

  const handleFormSubmit = async (values: AccountFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
      reset(DEFAULT_FORM_VALUES);
    } catch (error) {
      console.error('Failed to submit account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Account' : 'Create New Account'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update account details, balance, or institution information.'
              : 'Add a bank account, mobile wallet (bKash/Nagad), cash, or card.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Account Name */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Account Name *</Label>
            <Input
              id="account-name"
              placeholder="e.g. BRAC Bank Salary A/C, bKash Personal"
              {...register('name')}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type and Balance in 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account Type */}
            <div className="space-y-1.5">
              <Label htmlFor="account-type">Account Type *</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val as AccountType);
                    }}
                  >
                    <SelectTrigger id="account-type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((typeKey) => (
                        <SelectItem key={typeKey} value={typeKey}>
                          {ACCOUNT_TYPE_LABELS[typeKey]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-rose-500">{errors.type.message}</p>
              )}
            </div>

            {/* Current Balance */}
            <div className="space-y-1.5">
              <Label htmlFor="account-balance">
                {selectedType === 'CREDIT_CARD' ? 'Outstanding Amount (৳)' : 'Current Balance (৳) *'}
              </Label>
              <Input
                id="account-balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.balance)}
              />
              {errors.balance && (
                <p className="text-xs text-rose-500">{errors.balance.message}</p>
              )}
            </div>
          </div>

          {/* Institution & Last 4 Digits in 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Institution */}
            <div className="space-y-1.5">
              <Label htmlFor="account-institution">Institution / Provider</Label>
              <Input
                id="account-institution"
                placeholder="e.g. BRAC Bank, bKash, City Bank"
                {...register('institution')}
                aria-invalid={Boolean(errors.institution)}
              />
              {errors.institution && (
                <p className="text-xs text-rose-500">{errors.institution.message}</p>
              )}
            </div>

            {/* Last 4 Digits */}
            <div className="space-y-1.5">
              <Label htmlFor="account-last4">Account / Card Last 4 Digits</Label>
              <Input
                id="account-last4"
                maxLength={4}
                placeholder="e.g. 4821"
                {...register('accountNumberLast4')}
                aria-invalid={Boolean(errors.accountNumberLast4)}
              />
              {errors.accountNumberLast4 && (
                <p className="text-xs text-rose-500">
                  {errors.accountNumberLast4.message}
                </p>
              )}
            </div>
          </div>

          {/* Color Tag Selection */}
          <div className="space-y-2">
            <Label>Card Accent Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCOUNT_COLORS.map((c) => {
                const isSelected = selectedColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue('color', c.value)}
                    className={cn(
                      'size-7 rounded-full transition-all cursor-pointer flex items-center justify-center border-2',
                      isSelected
                        ? 'border-foreground scale-110 shadow-sm'
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
              {isEditMode ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
