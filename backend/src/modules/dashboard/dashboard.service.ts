import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(userId: string, targetMonth?: string) {
    // 1. Calculate Total Balance across non-archived accounts
    const accounts = await this.prisma.account.findMany({
      where: { userId, isArchived: false },
    });

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );

    // 2. Determine target year and month
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // 1-12

    if (targetMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(targetMonth)) {
      const [y, m] = targetMonth.split('-');
      year = parseInt(y, 10);
      month = parseInt(m, 10);
    }

    const currentMonthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const nextMonthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    // 3. Transactions for the selected month
    const monthTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      include: {
        category: true,
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const categorySpendingMap = new Map<
      string,
      { categoryName: string; color: string; amount: number }
    >();

    for (const tx of monthTransactions) {
      const amt = Number(tx.amount);
      if (tx.type === TransactionType.INCOME) {
        monthlyIncome += amt;
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyExpense += amt;

        if (tx.categoryId && tx.category) {
          const existing = categorySpendingMap.get(tx.categoryId) || {
            categoryName: tx.category.name,
            color: tx.category.color,
            amount: 0,
          };
          existing.amount += amt;
          categorySpendingMap.set(tx.categoryId, existing);
        }
      }
    }

    const netSavings = monthlyIncome - monthlyExpense;
    const savingsRate =
      monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

    // 4. Category Breakdown
    const categoryBreakdown = Array.from(categorySpendingMap.entries())
      .map(([categoryId, item]) => ({
        categoryId,
        categoryName: item.categoryName,
        color: item.color,
        amount: Math.round(item.amount * 100) / 100,
        percentage:
          monthlyExpense > 0
            ? Math.round((item.amount / monthlyExpense) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Monthly Trend (Past 6 months)
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyTrend: Array<{
      month: string;
      income: number;
      expense: number;
      savings: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const t = new Date(Date.UTC(year, month - 1 - i, 1, 0, 0, 0));
      const tYear = t.getUTCFullYear();
      const tMonth = t.getUTCMonth(); // 0-11
      const tStart = new Date(Date.UTC(tYear, tMonth, 1, 0, 0, 0));
      const tEnd = new Date(Date.UTC(tYear, tMonth + 1, 1, 0, 0, 0));

      const [incomeAgg, expenseAgg] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.INCOME,
            date: { gte: tStart, lt: tEnd },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            date: { gte: tStart, lt: tEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      const inc = Number(incomeAgg._sum.amount || 0);
      const exp = Number(expenseAgg._sum.amount || 0);

      monthlyTrend.push({
        month: `${monthNames[tMonth]}`,
        income: inc,
        expense: exp,
        savings: inc - exp,
      });
    }

    // 6. Recent Transactions (last 6)
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
      orderBy: { date: 'desc' },
      take: 6,
    });

    return {
      totalBalance: Math.round(totalBalance * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpense: Math.round(monthlyExpense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      categoryBreakdown,
      monthlyTrend,
      recentTransactions,
      activeAccounts: accounts,
    };
  }
}

