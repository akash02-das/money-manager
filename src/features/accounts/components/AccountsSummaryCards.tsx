'use client';

import React from 'react';
import { Landmark, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface AccountsSummaryCardsProps {
  totalBalance: number;
  bankAndSavingsTotal: number;
  walletsAndCashTotal: number;
  creditCardTotal: number;
  activeCount: number;
}

export function AccountsSummaryCards({
  totalBalance,
  bankAndSavingsTotal,
  walletsAndCashTotal,
  creditCardTotal,
  activeCount,
}: AccountsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Net Balance */}
      <Card className="transition-all hover:shadow-sm border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Net Balance
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {formatCurrency(totalBalance, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {activeCount} active account{activeCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Wallet className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank & Savings */}
      <Card className="transition-all hover:shadow-sm border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bank & Savings
              </p>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(bankAndSavingsTotal, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Institutional deposits
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Landmark className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets & Cash */}
      <Card className="transition-all hover:shadow-sm border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wallets & Cash
              </p>
              <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {formatCurrency(walletsAndCashTotal, 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                bKash, Nagad & cash on hand
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Smartphone className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Card Liability */}
      <Card className="transition-all hover:shadow-sm border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Credit Card Liability
              </p>
              <div
                className={cn(
                  'text-2xl font-bold tracking-tight mt-1',
                  creditCardTotal < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : creditCardTotal > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                )}
              >
                {formatCurrency(Math.abs(creditCardTotal), 'BDT')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {creditCardTotal < 0
                  ? 'Total outstanding debt to pay'
                  : creditCardTotal > 0
                  ? 'Overpaid credit balance'
                  : 'No outstanding credit dues'}
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl',
                creditCardTotal < 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <CreditCard className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
