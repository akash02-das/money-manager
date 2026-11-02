import React from 'react';
import { cn } from '@/lib/utils';
import type { BudgetHealthStatus } from '../context/BudgetsContext';

interface BudgetProgressBarProps {
  percentage: number;
  status: BudgetHealthStatus;
  className?: string;
  showLabel?: boolean;
}

export function BudgetProgressBar({
  percentage,
  status,
  className,
  showLabel = false,
}: BudgetProgressBarProps) {
  const clampedWidth = Math.min(Math.max(percentage, 0), 100);

  const statusColor = {
    ON_TRACK: 'bg-emerald-500',
    WARNING: 'bg-amber-500',
    OVER_BUDGET: 'bg-rose-500',
  }[status];

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', statusColor)}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>

      {showLabel && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span>{percentage.toFixed(1)}% spent</span>
          <span>{clampedWidth >= 100 ? 'Limit reached' : `${(100 - clampedWidth).toFixed(1)}% left`}</span>
        </div>
      )}
    </div>
  );
}
