export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP';

export type AccountType =
  | 'CASH'
  | 'BANK'
  | 'MOBILE_WALLET'
  | 'CREDIT_CARD'
  | 'SAVINGS'
  | 'OTHER';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  institution?: string;
  accountNumberLast4?: string;
  color?: string;
  isArchived: boolean;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string; // ISO date string
  categoryId: string;
  category?: Category;
  accountId: string;
  account?: Account;
  toAccountId?: string;
  toAccount?: Account;
  notes?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  category?: Category;
  month: string; // YYYY-MM
  limit: number;
  spent: number;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategorySpending[];
}
