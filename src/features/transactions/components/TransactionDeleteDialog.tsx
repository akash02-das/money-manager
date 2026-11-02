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
import type { Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';

interface TransactionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onConfirmDelete: () => Promise<void>;
}

export function TransactionDeleteDialog({
  open,
  onOpenChange,
  transaction,
  onConfirmDelete,
}: TransactionDeleteDialogProps) {
  if (!transaction) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              Are you sure you want to delete &quot;{transaction.description}&quot; ({formatCurrency(transaction.amount, 'BDT')})?
            </span>
            <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
              ⚡ <strong>Account Balance Impact:</strong> Deleting this transaction will
              automatically reverse its balance adjustment on{' '}
              <strong>{transaction.account?.name || 'the linked account'}</strong>
              {transaction.toAccount && (
                <> and <strong>{transaction.toAccount.name}</strong></>
              )}.
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
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
