import Link from 'next/link';
import { Landmark, Smartphone, CreditCard, PiggyBank, Banknote, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { Account, AccountType } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { ACCOUNT_TYPE_LABELS } from '@/lib/constants';

interface AccountsSnapshotCardProps {
  accounts: Account[];
}

const ACCOUNT_ICONS: Record<AccountType, React.ElementType> = {
  BANK: Landmark,
  MOBILE_WALLET: Smartphone,
  CREDIT_CARD: CreditCard,
  SAVINGS: PiggyBank,
  CASH: Banknote,
  OTHER: Landmark,
};

export function AccountsSnapshotCard({ accounts }: AccountsSnapshotCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Your Accounts</CardTitle>
          <CardDescription>Overview of balances across institutions</CardDescription>
        </div>
        <Link
          href="/accounts"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <span>View all</span>
          <ChevronRight className="size-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-lg p-4">
            <Landmark className="size-8 text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No accounts yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
              Create your first account to start tracking cash, banks, or wallets.
            </p>
            <Link
              href="/accounts"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Create your first account</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          accounts.map((acc) => {
            const Icon = ACCOUNT_ICONS[acc.type] || Landmark;
            const isNegative = acc.balance < 0;

            return (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: acc.color || '#64748b' }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ACCOUNT_TYPE_LABELS[acc.type]}
                      {acc.accountNumberLast4 && ` •••• ${acc.accountNumberLast4}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(acc.balance, acc.currency)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
