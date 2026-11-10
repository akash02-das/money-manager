'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, ShieldCheck, HardDrive, CloudCheck } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useState, useEffect } from 'react';
import { useBudgets } from '@/features/budgets/hooks/useBudgets';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { activeAccountsCount } = useAccounts();
  const { activeCount: activeCategoriesCount } = useCategories();
  const { totalCount: totalTransactionsCount } = useTransactions();
  const { activeMonthBudgetsCount } = useBudgets();
  const { isDemo, isVerified } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen border-r border-border bg-card/60 backdrop-blur-md select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Wallet className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base tracking-tight text-foreground">
            Money Manager
          </span>
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            Personal Finance <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">BDT ৳</Badge>
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Main Menu
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const badgeValue = !isMounted
              ? undefined
              : item.href === '/accounts'
              ? activeAccountsCount
              : item.href === '/categories'
              ? activeCategoriesCount
              : item.href === '/transactions'
              ? totalTransactionsCount
              : item.href === '/budgets'
              ? activeMonthBudgetsCount
              : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'size-4.5 transition-transform group-hover:scale-105',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {badgeValue !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Account Status Section */}
      <div className="p-4 border-t border-border">
        {isDemo ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Local Account</span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
              Stored only in this browser (LocalStorage). Independent from server.
            </p>
          </div>
        ) : isVerified ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CloudCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Verified Account</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
              Email verified. Ledgers synchronized to cloud database.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-foreground">Encrypted Ledger</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Financial data encrypted & secure.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
