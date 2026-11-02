'use client';

import React, { useMemo } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
} from 'lucide-react';
import { parse, format, subMonths } from 'date-fns';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { SpendingTrendChart } from '@/features/dashboard/components/SpendingTrendChart';
import { CategoryBreakdownCard } from '@/features/dashboard/components/CategoryBreakdownCard';
import { RecentTransactionsCard } from '@/features/dashboard/components/RecentTransactionsCard';
import { AccountsSnapshotCard } from '@/features/dashboard/components/AccountsSnapshotCard';
import { MOCK_DASHBOARD_METRICS } from '@/mocks/finance-data';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { getLocalMonthKey, roundCurrency } from '@/lib/formatters';
import type { MonthlyTrendPoint, CategorySpending } from '@/types/finance';

export function DashboardView() {
  const { accounts, totalBalance } = useAccounts();
  const { transactions, recentTransactions } = useTransactions();
  const { categories } = useCategories();

  // Active accounts for the dashboard snapshot
  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.isArchived),
    [accounts]
  );

  // 1. Determine active month (newest transaction month or default to 2026-10)
  const activeMonthKey = useMemo(() => {
    if (transactions.length === 0) return '2026-10';
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return getLocalMonthKey(sorted[0].date);
  }, [transactions]);

  // Formatted human-readable month string (e.g. "October 2026")
  const activeMonthLabel = useMemo(() => {
    try {
      const parsed = parse(`${activeMonthKey}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1));
      return format(parsed, 'MMMM yyyy');
    } catch {
      return activeMonthKey;
    }
  }, [activeMonthKey]);

  // 2. Dynamic Monthly Metrics (Inflow, Outflow, Net Savings, Trends)
  const monthlyMetrics = useMemo(() => {
    const monthTxs = transactions.filter(
      (t) => getLocalMonthKey(t.date) === activeMonthKey
    );

    const income = monthTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Prior month calculation for trend comparison
    let prevMonthDate: Date;
    try {
      prevMonthDate = subMonths(
        parse(`${activeMonthKey}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1)),
        1
      );
    } catch {
      prevMonthDate = new Date(2000, 8, 1);
    }
    const prevMonthKey = format(prevMonthDate, 'yyyy-MM');
    const prevMonthLabel = format(prevMonthDate, 'MMM');

    const prevTxs = transactions.filter(
      (t) => getLocalMonthKey(t.date) === prevMonthKey
    );

    let prevIncome = 0;
    let prevExpense = 0;

    if (prevTxs.length > 0) {
      prevIncome = prevTxs
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      prevExpense = prevTxs
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
    } else {
      const seedPrev = MOCK_DASHBOARD_METRICS.monthlyTrend.find(
        (p) => p.month === prevMonthLabel
      );
      if (seedPrev) {
        prevIncome = seedPrev.income;
        prevExpense = seedPrev.expense;
      }
    }

    const incomeTrend =
      prevIncome > 0
        ? Number((((income - prevIncome) / prevIncome) * 100).toFixed(1))
        : undefined;

    const expenseTrend =
      prevExpense > 0
        ? Number((((expense - prevExpense) / prevExpense) * 100).toFixed(1))
        : undefined;

    const prevNetBalance = totalBalance - savings;
    const balanceTrend =
      prevNetBalance > 0
        ? Number((((totalBalance - prevNetBalance) / prevNetBalance) * 100).toFixed(1))
        : undefined;

    return {
      income: roundCurrency(income),
      expense: roundCurrency(expense),
      savings: roundCurrency(savings),
      savingsRate: Number(savingsRate.toFixed(1)),
      incomeTrend,
      expenseTrend,
      balanceTrend,
    };
  }, [transactions, activeMonthKey, totalBalance]);

  // 3. Dynamic Category Spending Breakdown for active month
  const dynamicCategoryBreakdown = useMemo<CategorySpending[]>(() => {
    const monthExpenses = transactions.filter(
      (t) => t.type === 'EXPENSE' && getLocalMonthKey(t.date) === activeMonthKey
    );

    const totalMonthExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    if (totalMonthExpense === 0) return [];

    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach((tx) => {
      categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
    });

    const list: CategorySpending[] = Object.entries(categoryTotals).map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = roundCurrency((amount / totalMonthExpense) * 100);
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Uncategorized',
        amount: roundCurrency(amount),
        percentage,
        color: cat?.color || '#6366f1',
      };
    });

    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [transactions, categories, activeMonthKey]);

  // 4. Dynamic Cash Flow Trend over the past 6 months
  const dynamicMonthlyTrend = useMemo<MonthlyTrendPoint[]>(() => {
    let anchorDate: Date;
    try {
      anchorDate = parse(`${activeMonthKey}-01`, 'yyyy-MM-dd', new Date(2000, 0, 1));
    } catch {
      anchorDate = new Date(2000, 9, 1);
    }

    const points: MonthlyTrendPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(anchorDate, i);
      const mKey = format(monthDate, 'yyyy-MM');
      const mLabel = format(monthDate, 'MMM');

      const txInMonth = transactions.filter((t) => getLocalMonthKey(t.date) === mKey);

      let income = 0;
      let expense = 0;

      if (txInMonth.length > 0) {
        income = txInMonth
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        expense = txInMonth
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        // Smooth fallback to baseline seed history for past unrecorded months
        const seed = MOCK_DASHBOARD_METRICS.monthlyTrend.find((p) => p.month === mLabel);
        if (seed) {
          income = seed.income;
          expense = seed.expense;
        }
      }

      points.push({
        month: mLabel,
        income: roundCurrency(income),
        expense: roundCurrency(expense),
        savings: roundCurrency(income - expense),
      });
    }

    return points;
  }, [transactions, activeMonthKey]);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          amount={totalBalance}
          trendPercent={monthlyMetrics.balanceTrend}
          trendLabel="vs last month"
          icon={Wallet}
          colorVariant="indigo"
        />
        <StatCard
          title="Total Inflow"
          amount={monthlyMetrics.income}
          trendPercent={monthlyMetrics.incomeTrend}
          trendLabel="vs last month"
          icon={ArrowDownCircle}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Outflow"
          amount={monthlyMetrics.expense}
          trendPercent={monthlyMetrics.expenseTrend}
          trendLabel="vs last month"
          icon={ArrowUpCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Net Savings"
          amount={monthlyMetrics.savings}
          trendPercent={monthlyMetrics.savingsRate}
          trendLabel="savings rate"
          icon={PiggyBank}
          colorVariant="amber"
        />
      </section>

      {/* Charts & Breakdown Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpendingTrendChart data={dynamicMonthlyTrend} />
        <CategoryBreakdownCard
          categories={dynamicCategoryBreakdown}
          monthLabel={activeMonthLabel}
        />
      </section>

      {/* Activity & Accounts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactionsCard transactions={recentTransactions} />
        <AccountsSnapshotCard accounts={activeAccounts} />
      </section>
    </div>
  );
}
