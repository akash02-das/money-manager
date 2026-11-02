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
import type { Category } from '@/types/finance';
import { ShieldAlert, AlertTriangle, Archive, Trash2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  linkedTransactionsCount?: number;
  linkedBudgetsCount?: number;
  onConfirmDelete: () => Promise<void>;
  onArchiveInstead?: () => Promise<void>;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  linkedTransactionsCount = 0,
  linkedBudgetsCount = 0,
  onConfirmDelete,
  onArchiveInstead,
}: CategoryDeleteDialogProps) {
  if (!category) return null;

  const isDefault = category.isDefault;
  const hasLinkedTransactions = linkedTransactionsCount > 0;
  const hasLinkedBudgets = linkedBudgetsCount > 0;
  const hasDependencies = isDefault || hasLinkedTransactions || hasLinkedBudgets;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {hasDependencies ? (
              <div className="p-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="size-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
            )}
            <AlertDialogTitle className="text-base sm:text-lg">
              {hasDependencies
                ? `Cannot Delete Category "${category.name}"`
                : `Delete Category "${category.name}"?`}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-3 text-left pt-1">
            {isDefault ? (
              <>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                    <Lock className="size-3.5" />
                    <span>System Default Category</span>
                  </div>
                  <p>
                    Default system categories are protected and cannot be deleted because they serve as foundational templates and fallbacks for financial reports.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/60 border border-border/70 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Archive className="size-3.5 text-amber-500" /> Recommended: Archive Category
                  </span>
                  <p>
                    Archiving hides this category from transaction input forms and budget selection menus without affecting historical reporting.
                  </p>
                </div>
              </>
            ) : hasLinkedTransactions || hasLinkedBudgets ? (
              <>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                    <span>Active Referential Dependencies</span>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {hasLinkedTransactions && (
                      <li className="flex items-center justify-between">
                        <span>• Recorded Ledger Transactions:</span>
                        <Badge variant="outline" className="border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0 h-4">
                          {linkedTransactionsCount} linked transaction{linkedTransactionsCount === 1 ? '' : 's'}
                        </Badge>
                      </li>
                    )}
                    {hasLinkedBudgets && (
                      <li className="flex items-center justify-between">
                        <span>• Monthly Budget Caps:</span>
                        <Badge variant="outline" className="border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0 h-4">
                          {linkedBudgetsCount} active budget{linkedBudgetsCount === 1 ? '' : 's'}
                        </Badge>
                      </li>
                    )}
                  </ul>
                  <p className="text-[11px] opacity-90 pt-1">
                    Deleting this category would leave transactions uncategorized and corrupt monthly budget tracking.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/60 border border-border/70 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Archive className="size-3.5 text-amber-500" /> Recommended: Archive Category
                  </span>
                  <p>
                    Archiving safely retires the category from new inputs while preserving historical categorization in all past records and charts.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span>
                  Are you sure you want to permanently delete this category? This category has <strong>no linked transactions or budgets</strong>, so it can be safely removed. This action cannot be undone.
                </span>
                <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
                  💡 <strong>Tip:</strong> Archiving is also available if you might want to restore this category later.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5 pt-2">
          <AlertDialogCancel>
            {hasDependencies ? 'Close' : 'Cancel'}
          </AlertDialogCancel>

          {onArchiveInstead && !category.isArchived && (
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              onClick={async () => {
                await onArchiveInstead();
                onOpenChange(false);
              }}
            >
              <Archive className="size-3.5" />
              <span>Archive Category</span>
            </AlertDialogAction>
          )}

          {!hasDependencies && (
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

