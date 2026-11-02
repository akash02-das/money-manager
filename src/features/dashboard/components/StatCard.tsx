import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  currency?: 'BDT' | 'USD' | 'EUR';
  trendPercent?: number;
  trendLabel?: string;
  icon: LucideIcon;
  colorVariant?: 'default' | 'emerald' | 'rose' | 'indigo' | 'amber';
}

export function StatCard({
  title,
  amount,
  currency = 'BDT',
  trendPercent,
  trendLabel = 'vs last month',
  icon: Icon,
  colorVariant = 'default',
}: StatCardProps) {
  const isPositiveTrend = trendPercent !== undefined && trendPercent >= 0;

  const colorStyles = {
    default: {
      bg: 'bg-primary/5 text-primary border-primary/20',
      iconBg: 'bg-primary/10 text-primary',
    },
    emerald: {
      bg: 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      bg: 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    amber: {
      bg: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  }[colorVariant];

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(amount, currency)}
            </div>
          </div>
          <div className={cn('p-2.5 rounded-xl transition-transform hover:scale-110', colorStyles.iconBg)}>
            <Icon className="size-5" />
          </div>
        </div>

        {trendPercent !== undefined && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold text-[11px]',
                isPositiveTrend
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {isPositiveTrend ? '+' : ''}
              {trendPercent}%
            </span>
            <span className="text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
