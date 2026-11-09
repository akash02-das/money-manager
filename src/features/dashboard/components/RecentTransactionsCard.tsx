import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronRight,
  Receipt,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <CardDescription>Latest financial activity across all your accounts</CardDescription>
        </div>
        <Link
          href="/transactions"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <span>View all</span>
          <ChevronRight className="size-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Receipt className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Your financial ledger is completely fresh. Record income, expenses, or transfers to see your recent transactions here.
            </p>
            <Link href="/transactions" className="mt-4">
              <Button size="sm" className="gap-1.5 text-xs">
                <PlusCircle className="size-3.5" />
                <span>Add your first transaction</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase font-medium">
                <tr>
                  <th className="py-2.5 px-4">Transaction</th>
                  <th className="py-2.5 px-4 hidden md:table-cell">Account</th>
                  <th className="py-2.5 px-4 hidden sm:table-cell">Date</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isTransfer = tx.type === 'TRANSFER';

                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {/* Description & Category */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex size-8 shrink-0 items-center justify-center rounded-lg',
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="size-4" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="size-4" />
                            ) : (
                              <ArrowUpRight className="size-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tx.category ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
                                >
                                  {tx.category.name}
                                </Badge>
                              ) : isTransfer ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-4 font-normal text-indigo-500"
                                >
                                  Transfer
                                </Badge>
                              ) : null}
                              <span className="sm:hidden text-[11px] text-muted-foreground">
                                {formatDate(tx.date, 'MMM d')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {tx.account?.name || 'Primary'}
                        </span>
                        {tx.toAccount && (
                          <span className="text-[11px] text-muted-foreground block">
                            → {tx.toAccount.name}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 hidden sm:table-cell text-xs text-muted-foreground">
                        {formatDate(tx.date, 'dd MMM yyyy')}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={cn(
                            'font-semibold text-sm',
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isTransfer
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-foreground'
                          )}
                        >
                          {isIncome && '+ '}
                          {tx.type === 'EXPENSE' && '- '}
                          {formatCurrency(tx.amount, 'BDT')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
