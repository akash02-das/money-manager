'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { BudgetWithLiveSpending } from '../context/BudgetsContext';

interface BudgetDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetWithLiveSpending | null;
  onConfirmDelete: () => Promise<void>;
}

export function BudgetDeleteDialog({
  open,
  onOpenChange,
  budget,
  onConfirmDelete,
}: BudgetDeleteDialogProps) {
  if (!budget) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Budget Cap?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              Are you sure you want to remove the monthly budget for{' '}
              <strong>{budget.category?.name || 'this category'}</strong>?
            </span>
            <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
              ℹ️ <strong>Note:</strong> Removing this budget will not affect any of your
              past or future transactions. It simply removes the spending progress tracking
              target for this month.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={async () => {
              await onConfirmDelete();
              onOpenChange(false);
            }}
          >
            Remove Budget
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
