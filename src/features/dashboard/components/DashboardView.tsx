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
import {
  MOCK_ACCOUNTS,
  MOCK_DASHBOARD_METRICS,
  MOCK_TRANSACTIONS,
} from '@/mocks/finance-data';

export function DashboardView() {
  const metrics = MOCK_DASHBOARD_METRICS;
  const accounts = MOCK_ACCOUNTS;
  const transactions = MOCK_TRANSACTIONS;

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          amount={metrics.totalBalance}
          trendPercent={12.4}
          trendLabel="vs last month"
          icon={Wallet}
          colorVariant="indigo"
        />
        <StatCard
          title="October Income"
          amount={metrics.monthlyIncome}
          trendPercent={8.2}
          trendLabel="vs September"
          icon={ArrowDownCircle}
          colorVariant="emerald"
        />
        <StatCard
          title="October Expenses"
          amount={metrics.monthlyExpense}
          trendPercent={-4.5}
          trendLabel="vs September"
          icon={ArrowUpCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Net Savings"
          amount={metrics.netSavings}
          trendPercent={metrics.savingsRate}
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
        <RecentTransactionsCard transactions={transactions} />
        <AccountsSnapshotCard accounts={accounts} />
      </section>
    </div>
  );
}
