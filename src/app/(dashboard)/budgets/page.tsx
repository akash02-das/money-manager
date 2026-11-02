import { BudgetsListView } from '@/features/budgets/components/BudgetsListView';

export const metadata = {
  title: 'Budgets & Spending Limits — Money Manager',
  description: 'Set monthly category budgets and track live spending limits in BDT.',
};

export default function BudgetsPage() {
  return <BudgetsListView />;
}

