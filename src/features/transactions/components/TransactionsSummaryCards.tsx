'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TransactionsSummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  totalCount: number;
}

export function TransactionsSummaryCards({
  totalIncome,
  totalExpense,
  netCashFlow,
  totalCount,
}: TransactionsSummaryCardsProps) {
  const isNetPositive = netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Inflow */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Inflow (Income)
              </p>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalIncome, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Credited to accounts
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Outflow */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Outflow (Expense)
              </p>
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(totalExpense, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Debited for expenses
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Net Cash Flow
              </p>
              <div
                className={cn(
                  'text-2xl font-bold tracking-tight mt-1',
                  isNetPositive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {formatCurrency(netCashFlow, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isNetPositive ? 'Positive surplus' : 'Deficit / Net spend'}
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl',
                isNetPositive
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              <ArrowLeftRight className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Transactions */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Records
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {totalCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across all accounts
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <FileText className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
