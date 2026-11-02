'use client';

import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
} from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { SpendingTrendChart } from '@/features/dashboard/components/SpendingTrendChart';
import { CategoryBreakdownCard } from '@/features/dashboard/components/CategoryBreakdownCard';
import { RecentTransactionsCard } from '@/features/dashboard/components/RecentTransactionsCard';
import { AccountsSnapshotCard } from '@/features/dashboard/components/AccountsSnapshotCard';
import { MOCK_DASHBOARD_METRICS } from '@/mocks/finance-data';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';

export function DashboardView() {
  const metrics = MOCK_DASHBOARD_METRICS;
  const { accounts, totalBalance } = useAccounts();
  const { recentTransactions, totalIncome, totalExpense } = useTransactions();

  // Active accounts for the dashboard snapshot
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // Dynamic net savings and savings rate
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          amount={totalBalance}
          trendPercent={12.4}
          trendLabel="vs last month"
          icon={Wallet}
          colorVariant="indigo"
        />
        <StatCard
          title="Total Inflow"
          amount={totalIncome}
          trendPercent={8.2}
          trendLabel="vs last month"
          icon={ArrowDownCircle}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Outflow"
          amount={totalExpense}
          trendPercent={-4.5}
          trendLabel="vs last month"
          icon={ArrowUpCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Net Savings"
          amount={netSavings}
          trendPercent={Number(savingsRate.toFixed(1))}
          trendLabel="savings rate"
          icon={PiggyBank}
          colorVariant="amber"
        />
      </section>

      {/* Charts & Breakdown Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpendingTrendChart data={metrics.monthlyTrend} />
        <CategoryBreakdownCard categories={metrics.categoryBreakdown} />
      </section>

      {/* Activity & Accounts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactionsCard transactions={recentTransactions} />
        <AccountsSnapshotCard accounts={activeAccounts} />
      </section>
    </div>
  );
}
