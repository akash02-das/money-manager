'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import type { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Wallet,
  Tag,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const isTransfer = transaction.type === 'TRANSFER';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2">
            <span>Transaction Receipt</span>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-2 py-0.5 font-semibold',
                isIncome
                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  : isTransfer
                  ? 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                  : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5'
              )}
            >
              {transaction.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Reference: <span className="font-mono text-xs">{transaction.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Amount Display */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-5 text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Amount
          </p>
          <div
            className={cn(
              'text-3xl font-bold tracking-tight',
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : isTransfer
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-foreground'
            )}
          >
            {isIncome && '+ '}
            {transaction.type === 'EXPENSE' && '- '}
            {formatCurrency(transaction.amount, 'BDT')}
          </div>
          <p className="font-medium text-foreground text-sm pt-1">
            {transaction.description}
          </p>
        </div>

        {/* Audit Details List */}
        <div className="divide-y divide-border/50 text-xs">
          {/* Date & Time */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="size-3.5" /> Date & Time
            </span>
            <span className="font-medium text-foreground">
              {formatDate(transaction.date, 'dd MMMM yyyy, hh:mm a')}
            </span>
          </div>

          {/* Account */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Wallet className="size-3.5" />
              {isTransfer ? 'From → To Account' : 'Account'}
            </span>
            <span className="font-medium text-foreground text-right">
              {transaction.account?.name || 'Account'}
              {transaction.toAccount && ` → ${transaction.toAccount.name}`}
            </span>
          </div>

          {/* Category */}
          {transaction.category && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Tag className="size-3.5" /> Category
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: transaction.category.color }}
                />
                <CategoryIcon name={transaction.category.icon} className="size-3 text-muted-foreground" />
                <span>{transaction.category.name}</span>
              </span>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="py-2.5 flex items-start justify-between gap-4">
              <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                <FileText className="size-3.5" /> Notes
              </span>
              <span className="text-foreground text-right leading-relaxed">
                {transaction.notes}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5"
            onClick={() => {
              onOpenChange(false);
              onDelete(transaction);
            }}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(transaction);
              }}
              className="gap-1.5"
            >
              <Edit2 className="size-3.5" /> Edit
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
