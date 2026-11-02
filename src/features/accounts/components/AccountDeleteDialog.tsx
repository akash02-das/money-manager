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
import type { Account } from '@/types/finance';
import { ShieldAlert, AlertTriangle, Archive, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccountDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  linkedTransactionsCount?: number;
  onConfirmDelete: () => Promise<void>;
  onArchiveInstead?: () => Promise<void>;
}

export function AccountDeleteDialog({
  open,
  onOpenChange,
  account,
  linkedTransactionsCount = 0,
  onConfirmDelete,
  onArchiveInstead,
}: AccountDeleteDialogProps) {
  if (!account) return null;

  const hasLinkedTransactions = linkedTransactionsCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {hasLinkedTransactions ? (
              <div className="p-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="size-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
            )}
            <AlertDialogTitle className="text-base sm:text-lg">
              {hasLinkedTransactions
                ? `Cannot Delete "${account.name}"`
                : `Delete "${account.name}"?`}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-3 text-left pt-1">
            {hasLinkedTransactions ? (
              <>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                    <span>Active Ledger Dependency</span>
                    <Badge variant="outline" className="border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0 h-4">
                      {linkedTransactionsCount} linked transaction{linkedTransactionsCount === 1 ? '' : 's'}
                    </Badge>
                  </div>
                  <p>
                    This account cannot be deleted because it is linked to recorded financial transactions. Deleting it would corrupt your historical balance calculations and transaction records.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/60 border border-border/70 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Archive className="size-3.5 text-amber-500" /> Recommended: Archive Account
                  </span>
                  <p>
                    Archiving safely removes the account from active balance cards and transaction selection dropdowns while preserving your past ledger history intact.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span>
                  Are you sure you want to permanently delete this account? This account has <strong>no linked transactions</strong>, so it can be safely removed. This action cannot be undone.
                </span>
                <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
                  💡 <strong>Tip:</strong> You can also choose to <strong>Archive</strong> instead if you plan to reuse this account details in the future.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5 pt-2">
          <AlertDialogCancel>
            {hasLinkedTransactions ? 'Close' : 'Cancel'}
          </AlertDialogCancel>

          {onArchiveInstead && !account.isArchived && (
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              onClick={async () => {
                await onArchiveInstead();
                onOpenChange(false);
              }}
            >
              <Archive className="size-3.5" />
              <span>Archive Account</span>
            </AlertDialogAction>
          )}

          {!hasLinkedTransactions && (
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              onClick={async () => {
                await onConfirmDelete();
                onOpenChange(false);
              }}
            >
              <Trash2 className="size-3.5" />
              <span>Delete Permanently</span>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
