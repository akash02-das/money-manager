'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import type { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewDetails: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFilteredCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TransactionsTable({
  transactions,
  onViewDetails,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  totalFilteredCount,
  onPageChange,
  onPageSizeChange,
}: TransactionsTableProps) {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground uppercase font-medium border-b border-border/60">
            <tr>
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center w-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isTransfer = tx.type === 'TRANSFER';

              return (
                <tr
                  key={tx.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* Description & Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-xl shadow-2xs',
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="size-4.5" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="size-4.5" />
                        ) : (
                          <ArrowUpRight className="size-4.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate max-w-xs">
                          {tx.description}
                        </p>
                        {tx.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-xs">
                    {tx.category ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-foreground font-medium border border-border/40">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: tx.category.color }}
                        />
                        <CategoryIcon name={tx.category.icon} className="size-3 text-muted-foreground" />
                        <span>{tx.category.name}</span>
                      </span>
                    ) : isTransfer ? (
                      <Badge variant="outline" className="text-[11px] font-normal text-indigo-500 border-indigo-500/30">
                        Account Transfer
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Account */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">
                        {tx.account?.name || 'Primary Account'}
                      </span>
                      {tx.toAccount && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span>→</span> {tx.toAccount.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/90 block">
                      {formatDate(tx.date, 'dd MMM yyyy')}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(tx.date, 'hh:mm a')}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={cn(
                        'font-bold text-sm tracking-tight',
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-foreground'
                      )}
                    >
                      {isIncome && '+ '}
                      {tx.type === 'EXPENSE' && '- '}
                      {formatCurrency(tx.amount, 'BDT')}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => onViewDetails(tx)}
                        >
                          <Eye className="size-3.5 text-muted-foreground" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => onEdit(tx)}
                        >
                          <Edit2 className="size-3.5 text-muted-foreground" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
                          onClick={() => onDelete(tx)}
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-border/50">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const isTransfer = tx.type === 'TRANSFER';

          return (
            <div
              key={tx.id}
              className="p-4 flex items-start justify-between gap-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl shadow-2xs mt-0.5',
                    isIncome
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : isTransfer
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  )}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="size-4.5" />
                  ) : isTransfer ? (
                    <ArrowLeftRight className="size-4.5" />
                  ) : (
                    <ArrowUpRight className="size-4.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate max-w-[170px]">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(tx.date, 'dd MMM yyyy')} • {tx.account?.name || 'Account'}
                    {tx.toAccount && ` → ${tx.toAccount.name}`}
                  </p>
                  {tx.category && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-1 font-normal">
                      {tx.category.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <span
                  className={cn(
                    'font-bold text-sm',
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isTransfer
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-foreground'
                  )}
                >
                  {isIncome && '+ '}
                  {tx.type === 'EXPENSE' && '- '}
                  {formatCurrency(tx.amount, 'BDT')}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onViewDetails(tx)}>
                      <Eye className="size-3.5" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onEdit(tx)}>
                      <Edit2 className="size-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2" onClick={() => onDelete(tx)}>
                      <Trash2 className="size-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
        <div>
          {totalFilteredCount > 0 ? (
            <span>
              Showing <strong className="text-foreground">{startIndex}</strong> to{' '}
              <strong className="text-foreground">{endIndex}</strong> of{' '}
              <strong className="text-foreground">{totalFilteredCount}</strong> transactions
            </span>
          ) : (
            <span>0 transactions</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-background border border-border rounded-md px-1.5 py-0.5 text-xs text-foreground cursor-pointer outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="size-7"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="px-2 font-medium text-foreground">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="size-7"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
