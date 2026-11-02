import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
} from 'lucide-react';
import type { NavItem } from '@/types/navigation';
import type { AccountType } from '@/types/finance';

export const APP_NAME = 'Money Manager';
export const DEFAULT_CURRENCY = 'BDT';

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: 'Accounts',
    href: '/accounts',
    icon: WalletCards,
    badge: '5',
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Budgets',
    href: '/budgets',
    icon: Target,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: PieChart,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'Cash',
  BANK: 'Bank Account',
  MOBILE_WALLET: 'Mobile Wallet',
  CREDIT_CARD: 'Credit Card',
  SAVINGS: 'Savings',
  OTHER: 'Other',
};
