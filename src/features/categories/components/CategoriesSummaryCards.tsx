'use client';

import React from 'react';
import { PieChart, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CategoriesSummaryCardsProps {
  totalActive: number;
  expenseCount: number;
  incomeCount: number;
  customCount: number;
}

export function CategoriesSummaryCards({
  totalActive,
  expenseCount,
  incomeCount,
  customCount,
}: CategoriesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Active Categories */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Categories
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {totalActive}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Available for transaction tagging
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PieChart className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Expense Categories
              </p>
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-1">
                {expenseCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Spending & budget classification
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Income Categories
              </p>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {incomeCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Salary, client fees & returns
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card className="transition-all hover:shadow-xs border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Custom Categories
              </p>
              <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                {customCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Created by you
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
