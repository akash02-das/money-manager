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

interface AccountDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onConfirmDelete: () => Promise<void>;
  onArchiveInstead?: () => Promise<void>;
}

export function AccountDeleteDialog({
  open,
  onOpenChange,
  account,
  onConfirmDelete,
  onArchiveInstead,
}: AccountDeleteDialogProps) {
  if (!account) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{account.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              Are you sure you want to delete this account? This action cannot be
              undone.
            </span>
            <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
              💡 <strong>Tip:</strong> If you have past transactions linked to this
              account, consider <strong>Archiving</strong> it instead. Archiving
              hides the account from active balances while preserving your transaction
              history.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5">
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          {onArchiveInstead && !account.isArchived && (
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={async () => {
                await onArchiveInstead();
                onOpenChange(false);
              }}
            >
              Archive Instead
            </AlertDialogAction>
          )}

          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={async () => {
              await onConfirmDelete();
              onOpenChange(false);
            }}
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
