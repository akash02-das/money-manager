'use client';

import React from 'react';
import { Target, TrendingDown, PiggyBank, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface BudgetsSummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  budgetCount: number;
}

export function BudgetsSummaryCards({
  totalBudget,
  totalSpent,
  totalRemaining,
  overallPercentage,
  budgetCount,
}: BudgetsSummaryCardsProps) {
  const isOver = totalRemaining < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Budget Allocated */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Budget Allocated
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {formatCurrency(totalBudget, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {budgetCount} category cap{budgetCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Target className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent in Budgeted Categories */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Spent So Far
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {formatCurrency(totalSpent, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Debited in this month
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Budget Margin */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isOver ? 'Overall Deficit' : 'Remaining Safe Margin'}
              </p>
              <div
                className={cn(
                  'text-2xl font-bold tracking-tight mt-1',
                  isOver
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {isOver && '- '}
                {formatCurrency(Math.abs(totalRemaining), 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isOver ? 'Exceeded allocated budget' : 'Available to spend'}
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl',
                isOver
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              )}
            >
              <PiggyBank className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Pace / Burn Rate */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Overall Burn Rate
              </p>
              <div
                className={cn(
                  'text-2xl font-bold tracking-tight mt-1',
                  overallPercentage > 100
                    ? 'text-rose-600 dark:text-rose-400'
                    : overallPercentage >= 80
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {overallPercentage.toFixed(1)}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Of monthly limit used
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Gauge className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
