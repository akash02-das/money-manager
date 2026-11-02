'use client';

import React from 'react';
import {
  Landmark,
  Smartphone,
  CreditCard,
  PiggyBank,
  Banknote,
  MoreVertical,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Account, AccountType } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onToggleArchive: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const ACCOUNT_ICONS: Record<AccountType, React.ElementType> = {
  BANK: Landmark,
  MOBILE_WALLET: Smartphone,
  CREDIT_CARD: CreditCard,
  SAVINGS: PiggyBank,
  CASH: Banknote,
  OTHER: Landmark,
};

export function AccountCard({
  account,
  onEdit,
  onToggleArchive,
  onDelete,
}: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type] || Landmark;
  const isNegative = account.balance < 0;
  const isCreditCard = account.type === 'CREDIT_CARD';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-border/70',
        account.isArchived && 'opacity-65 bg-muted/20 border-dashed'
      )}
    >
      {/* Top Color Accent Ribbon */}
      <div
        className="h-1.5 w-full transition-all group-hover:h-2"
        style={{ backgroundColor: account.color || '#0284c7' }}
      />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Account Icon & Main Details */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: account.color || '#0284c7' }}
            >
              <Icon className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                  {account.name}
                </h3>
                {account.isArchived && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted">
                    Archived
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground flex-wrap">
                <span>{ACCOUNT_TYPE_LABELS[account.type]}</span>
                {account.institution && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{account.institution}</span>
                  </>
                )}
                {account.accountNumberLast4 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">•••• {account.accountNumberLast4}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Account options</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(account)}
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                <span>Edit Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onToggleArchive(account)}
              >
                {account.isArchived ? (
                  <>
                    <ArchiveRestore className="size-3.5 text-emerald-500" />
                    <span>Unarchive</span>
                  </>
                ) : (
                  <>
                    <Archive className="size-3.5 text-amber-500" />
                    <span>Archive</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
                onClick={() => onDelete(account)}
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance Display */}
        <div className="mt-5 pt-3 border-t border-border/50 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {isCreditCard
                ? account.balance < 0
                  ? 'Outstanding Liability'
                  : account.balance > 0
                  ? 'Overpaid Credit'
                  : 'No Dues Owed'
                : 'Current Balance'}
            </p>
            <div
              className={cn(
                'text-xl font-bold tracking-tight',
                isNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : isCreditCard && account.balance > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-foreground'
              )}
            >
              {formatCurrency(account.balance, account.currency)}
            </div>
          </div>

          <Badge
            variant="secondary"
            className="text-[10px] font-mono px-2 py-0.5 bg-muted/60"
          >
            {account.currency}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
