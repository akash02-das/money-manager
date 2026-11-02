'use client';

import React from 'react';
import {
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import { BudgetProgressBar } from './BudgetProgressBar';
import type { BudgetWithLiveSpending } from '../context/BudgetsContext';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  budget: BudgetWithLiveSpending;
  onEdit: (budget: BudgetWithLiveSpending) => void;
  onDelete: (budget: BudgetWithLiveSpending) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const isOver = budget.status === 'OVER_BUDGET';
  const isWarning = budget.status === 'WARNING';

  const statusConfig = {
    ON_TRACK: {
      label: 'On Track',
      badgeClass: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
      icon: CheckCircle2,
    },
    WARNING: {
      label: 'Near Limit',
      badgeClass: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5',
      icon: AlertTriangle,
    },
    OVER_BUDGET: {
      label: 'Over Budget',
      badgeClass: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5',
      icon: AlertCircle,
    },
  }[budget.status];

  const StatusIcon = statusConfig.icon;

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-border/70">
      {/* Top Accent Ribbon */}
      <div
        className="h-1.5 w-full transition-all group-hover:h-2"
        style={{ backgroundColor: budget.category?.color || '#0284c7' }}
      />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Category Icon & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: budget.category?.color || '#0284c7' }}
            >
              <CategoryIcon
                name={budget.category?.icon || 'Tag'}
                className="size-5"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                {budget.category?.name || 'Uncategorized'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cap: {formatCurrency(budget.limit, 'BDT', { hideDecimals: true })}
              </p>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-2 py-0.5 font-medium gap-1', statusConfig.badgeClass)}
            >
              <StatusIcon className="size-3" />
              <span>{statusConfig.label}</span>
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Budget options</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => onEdit(budget)}
                >
                  <Edit2 className="size-3.5 text-muted-foreground" />
                  <span>Adjust Limit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
                  onClick={() => onDelete(budget)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Budget</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        <BudgetProgressBar
          percentage={budget.percentage}
          status={budget.status}
          showLabel
        />

        {/* Financial Figures Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-end justify-between text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">
              Spent so far
            </span>
            <span className="font-bold text-foreground text-sm">
              {formatCurrency(budget.liveSpent, 'BDT')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">
              {isOver ? 'Over budget by' : 'Remaining budget'}
            </span>
            <span
              className={cn(
                'font-bold text-sm',
                isOver
                  ? 'text-rose-600 dark:text-rose-400'
                  : isWarning
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {isOver && '- '}
              {formatCurrency(Math.abs(budget.remaining), 'BDT')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
